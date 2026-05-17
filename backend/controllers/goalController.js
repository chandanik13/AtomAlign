const Goal = require('../models/Goal');
const GoalSheet = require('../models/GoalSheet');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// Helper: calculate progress score
const calcProgress = (goal) => {
  if (!goal.actualAchievement || !goal.target) return 0;
  const actual = parseFloat(goal.actualAchievement);
  const target = parseFloat(goal.target);
  if (isNaN(actual) || isNaN(target) || target === 0) return 0;

  switch (goal.uomType) {
    case 'numeric':
    case 'percentage':
      return Math.min(Math.round((actual / target) * 100), 100);
    case 'zero-based':
      return actual === 0 ? 100 : 0;
    case 'timeline':
      return Math.min(Math.round((actual / target) * 100), 100);
    default:
      return 0;
  }
};

// @desc    Get my goals
// @route   GET /api/goals
const getMyGoals = async (req, res) => {
  try {
    const { cycle } = req.query;
    const query = { employeeId: req.user._id };
    if (cycle) query.cycle = cycle;

    const goals = await Goal.find(query).sort({ createdAt: -1 });
    const goalSheet = await GoalSheet.findOne({ employeeId: req.user._id, ...(cycle ? { cycle } : {}) });

    // Stats
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'approved' || (g.actualAchievement && parseFloat(g.actualAchievement) >= parseFloat(g.target))).length;
    const inProgress = goals.filter(g => g.status === 'submitted' || g.status === 'approved').length;
    const overallProgress = total > 0
      ? Math.round(goals.reduce((sum, g) => sum + (g.progressScore || 0), 0) / total)
      : 0;

    res.json({
      success: true,
      goals,
      goalSheet,
      stats: { total, completed, inProgress, overallProgress }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id).populate('employeeId', 'name email department');
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create goal
// @route   POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { thrustArea, title, description, uomType, target, targetDate, weightage, cycle } = req.body;

    // Check max goals limit
    const existingGoals = await Goal.find({ employeeId: req.user._id, cycle: cycle || '2024-25' });
    if (existingGoals.length >= 8) {
      return res.status(400).json({ success: false, message: 'Maximum 8 goals allowed per cycle' });
    }

    // Check min weightage
    if (weightage < 10) {
      return res.status(400).json({ success: false, message: 'Minimum weightage per goal is 10%' });
    }

    // Check total weightage
    const totalWeightage = existingGoals.reduce((sum, g) => sum + g.weightage, 0) + Number(weightage);
    if (totalWeightage > 100) {
      return res.status(400).json({
        success: false,
        message: `Total weightage cannot exceed 100%. Current total would be ${totalWeightage}%`
      });
    }

    const goal = await Goal.create({
      employeeId: req.user._id,
      thrustArea, title, description, uomType, target, targetDate,
      weightage: Number(weightage),
      cycle: cycle || '2024-25',
      status: 'draft'
    });

    // Update or create goal sheet
    let goalSheet = await GoalSheet.findOne({ employeeId: req.user._id, cycle: cycle || '2024-25' });
    if (!goalSheet) {
      goalSheet = await GoalSheet.create({
        employeeId: req.user._id,
        cycle: cycle || '2024-25',
        goals: [goal._id],
        totalWeightage: Number(weightage)
      });
    } else {
      goalSheet.goals.push(goal._id);
      goalSheet.totalWeightage = totalWeightage;
      await goalSheet.save();
    }

    goal.goalSheetId = goalSheet._id;
    await goal.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'GOAL_CREATED',
      entityType: 'Goal',
      entityId: goal._id,
      description: `Goal created: "${title}" with ${weightage}% weightage`
    });

    res.status(201).json({ success: true, goal, goalSheet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    if (goal.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (goal.isLocked) {
      return res.status(400).json({ success: false, message: 'Goal is locked and cannot be edited' });
    }

    if (goal.status === 'approved' || goal.status === 'locked') {
      return res.status(400).json({ success: false, message: 'Approved/locked goals cannot be edited' });
    }

    const oldData = { title: goal.title, weightage: goal.weightage, target: goal.target };
    const { thrustArea, title, description, uomType, target, targetDate, weightage } = req.body;

    // Re-check weightage
    if (weightage && Number(weightage) < 10) {
      return res.status(400).json({ success: false, message: 'Minimum weightage is 10%' });
    }

    if (weightage) {
      const otherGoals = await Goal.find({ employeeId: req.user._id, _id: { $ne: goal._id }, cycle: goal.cycle });
      const otherTotal = otherGoals.reduce((sum, g) => sum + g.weightage, 0);
      if (otherTotal + Number(weightage) > 100) {
        return res.status(400).json({ success: false, message: 'Total weightage cannot exceed 100%' });
      }
    }

    goal.thrustArea = thrustArea || goal.thrustArea;
    goal.title = title || goal.title;
    goal.description = description || goal.description;
    goal.uomType = uomType || goal.uomType;
    goal.target = target || goal.target;
    goal.targetDate = targetDate || goal.targetDate;
    goal.weightage = weightage ? Number(weightage) : goal.weightage;

    if (goal.status === 'rejected') goal.status = 'draft';

    await goal.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'GOAL_EDITED',
      entityType: 'Goal',
      entityId: goal._id,
      oldValue: oldData,
      newValue: { title: goal.title, weightage: goal.weightage, target: goal.target },
      description: `Goal "${goal.title}" edited`
    });

    res.json({ success: true, goal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Submit goal sheet
// @route   POST /api/goals/submit
const submitGoalSheet = async (req, res) => {
  try {
    const { cycle } = req.body;
    const goalCycle = cycle || '2024-25';

    const goals = await Goal.find({ employeeId: req.user._id, cycle: goalCycle, status: 'draft' });
    if (goals.length === 0) {
      return res.status(400).json({ success: false, message: 'No draft goals found to submit' });
    }

    const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
    // Also count already-submitted goals
    const submittedGoals = await Goal.find({ employeeId: req.user._id, cycle: goalCycle, status: { $in: ['submitted', 'approved'] } });
    const grandTotal = totalWeightage + submittedGoals.reduce((sum, g) => sum + g.weightage, 0);

    if (grandTotal !== 100) {
      return res.status(400).json({
        success: false,
        message: `Total weightage must equal 100%. Currently ${grandTotal}%`
      });
    }

    // Update all draft goals to submitted
    await Goal.updateMany(
      { employeeId: req.user._id, cycle: goalCycle, status: 'draft' },
      { status: 'submitted' }
    );

    // Update goal sheet
    const goalSheet = await GoalSheet.findOneAndUpdate(
      { employeeId: req.user._id, cycle: goalCycle },
      { status: 'submitted', submittedAt: new Date() },
      { new: true }
    );

    // Notify manager
    if (req.user.managerId) {
      await Notification.create({
        userId: req.user.managerId,
        title: 'New Goals Submitted',
        message: `${req.user.name} has submitted their goal sheet for review`,
        type: 'goal_submitted'
      });
    }

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'GOAL_SUBMITTED',
      entityType: 'GoalSheet',
      entityId: goalSheet?._id,
      description: `Goal sheet submitted for cycle ${goalCycle} with total weightage ${grandTotal}%`
    });

    res.json({ success: true, message: 'Goal sheet submitted successfully', goalSheet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    if (goal.employeeId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (goal.isLocked || goal.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot delete approved/locked goals' });
    }

    // Remove from goal sheet
    await GoalSheet.updateOne(
      { _id: goal.goalSheetId },
      { $pull: { goals: goal._id }, $inc: { totalWeightage: -goal.weightage } }
    );

    await Goal.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'GOAL_DELETED',
      entityType: 'Goal',
      entityId: goal._id,
      description: `Goal "${goal.title}" deleted`
    });

    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update quarterly achievement
// @route   PUT /api/goals/:id/quarterly
const updateQuarterlyAchievement = async (req, res) => {
  try {
    const { quarter, actualAchievement, status, notes } = req.body;
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    if (goal.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update quarterly entry
    const existingIdx = goal.quarterlyUpdates.findIndex(q => q.quarter === quarter);
    const update = { quarter, achievement: actualAchievement, status, updatedAt: new Date() };

    if (existingIdx >= 0) {
      goal.quarterlyUpdates[existingIdx] = update;
    } else {
      goal.quarterlyUpdates.push(update);
    }

    // Update overall achievement and progress
    goal.actualAchievement = actualAchievement;
    goal.progressScore = calcProgress({ ...goal.toObject(), actualAchievement });

    await goal.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'QUARTERLY_UPDATED',
      entityType: 'Goal',
      entityId: goal._id,
      description: `${quarter} achievement updated for "${goal.title}": ${actualAchievement} (${status})`
    });

    res.json({ success: true, goal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getMyGoals, getGoal, createGoal, updateGoal, submitGoalSheet, deleteGoal, updateQuarterlyAchievement };
