const Goal = require('../models/Goal');
const GoalSheet = require('../models/GoalSheet');
const User = require('../models/User');
const CheckInComment = require('../models/CheckInComment');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// @desc    Get team goals (submitted/approved) for manager review
// @route   GET /api/manager/goals
const getTeamGoals = async (req, res) => {
  try {
    const { status, cycle } = req.query;

    // Find employees under this manager
    const employees = await User.find({ managerId: req.user._id });
    const employeeIds = employees.map(e => e._id);

    const query = { employeeId: { $in: employeeIds } };
    if (status) query.status = status;
    if (cycle) query.cycle = cycle;

    const goals = await Goal.find(query)
      .populate('employeeId', 'name email department')
      .sort({ createdAt: -1 });

    // Team stats
    const teamMembers = employees.length;
    const pendingApprovals = goals.filter(g => g.status === 'submitted').length;
    const goalsCompleted = goals.filter(g => g.status === 'approved' && g.progressScore >= 100).length;
    const avgProgress = goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + (g.progressScore || 0), 0) / goals.length)
      : 0;

    res.json({
      success: true,
      goals,
      stats: { teamMembers, pendingApprovals, goalsCompleted, avgProgress }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get team members with their goal summaries
// @route   GET /api/manager/team
const getTeamOverview = async (req, res) => {
  try {
    const employees = await User.find({ managerId: req.user._id, role: 'employee' });

    const teamData = await Promise.all(employees.map(async (emp) => {
      const goals = await Goal.find({ employeeId: emp._id });
      const totalGoals = goals.length;
      const approvedGoals = goals.filter(g => g.status === 'approved').length;
      const avgProgress = totalGoals > 0
        ? Math.round(goals.reduce((sum, g) => sum + (g.progressScore || 0), 0) / totalGoals)
        : 0;
      return {
        employee: emp,
        totalGoals,
        approvedGoals,
        avgProgress
      };
    }));

    res.json({ success: true, team: teamData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve goal
// @route   PUT /api/manager/goals/:id/approve
const approveGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id).populate('employeeId', 'name email managerId');
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    // Check if employee is under this manager
    const employee = await User.findById(goal.employeeId._id);
    if (!employee || employee.managerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve this goal' });
    }

    if (goal.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Only submitted goals can be approved' });
    }

    goal.status = 'approved';
    goal.isLocked = true;
    await goal.save();

    // Check if all goals are approved, lock the sheet
    const goalSheet = await GoalSheet.findOne({ employeeId: goal.employeeId._id, cycle: goal.cycle });
    if (goalSheet) {
      const allGoals = await Goal.find({ goalSheetId: goalSheet._id });
      const allApproved = allGoals.every(g => g.status === 'approved');
      if (allApproved) {
        goalSheet.status = 'approved';
        goalSheet.approvedAt = new Date();
        await goalSheet.save();
      }
    }

    // Notify employee
    await Notification.create({
      userId: goal.employeeId._id,
      title: 'Goal Approved',
      message: `Your goal "${goal.title}" has been approved by your manager`,
      type: 'goal_approved',
      relatedGoalId: goal._id
    });

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'GOAL_APPROVED',
      entityType: 'Goal',
      entityId: goal._id,
      description: `Goal "${goal.title}" approved by manager ${req.user.name}`
    });

    res.json({ success: true, goal, message: 'Goal approved and locked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reject goal
// @route   PUT /api/manager/goals/:id/reject
const rejectGoal = async (req, res) => {
  try {
    const { reason } = req.body;
    const goal = await Goal.findById(req.params.id).populate('employeeId', 'name email managerId');
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const employee = await User.findById(goal.employeeId._id);
    if (!employee || employee.managerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    goal.status = 'rejected';
    goal.rejectionReason = reason || 'Returned for rework';
    await goal.save();

    // Notify employee
    await Notification.create({
      userId: goal.employeeId._id,
      title: 'Goal Returned for Rework',
      message: `Your goal "${goal.title}" was returned. Reason: ${reason || 'Please revise and resubmit'}`,
      type: 'goal_rejected',
      relatedGoalId: goal._id
    });

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'GOAL_REJECTED',
      entityType: 'Goal',
      entityId: goal._id,
      description: `Goal "${goal.title}" rejected: ${reason}`
    });

    res.json({ success: true, goal, message: 'Goal returned for rework' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add check-in comment
// @route   POST /api/manager/goals/:id/comment
const addComment = async (req, res) => {
  try {
    const { quarter, comment, rating } = req.body;
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const checkIn = await CheckInComment.create({
      goalId: goal._id,
      managerId: req.user._id,
      employeeId: goal.employeeId,
      quarter,
      comment,
      rating
    });

    // Also push to goal's managerComments
    goal.managerComments.push({ managerId: req.user._id, comment, createdAt: new Date() });
    await goal.save();

    // Notify employee
    await Notification.create({
      userId: goal.employeeId,
      title: 'Manager Added Check-in Comment',
      message: `Your manager added a ${quarter} check-in comment for "${goal.title}"`,
      type: 'manager_comment',
      relatedGoalId: goal._id
    });

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'MANAGER_COMMENT_ADDED',
      entityType: 'Goal',
      entityId: goal._id,
      description: `Manager added ${quarter} check-in comment for "${goal.title}"`
    });

    res.status(201).json({ success: true, checkIn });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get check-in comments for a goal
// @route   GET /api/manager/goals/:id/comments
const getComments = async (req, res) => {
  try {
    const comments = await CheckInComment.find({ goalId: req.params.id })
      .populate('managerId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Edit goal inline (target, weightage) before approval
// @route   PUT /api/manager/goals/:id/edit
const editGoalInline = async (req, res) => {
  try {
    const { target, weightage } = req.body;
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    if (goal.isLocked) {
      return res.status(400).json({ success: false, message: 'Goal is locked' });
    }

    const oldData = { target: goal.target, weightage: goal.weightage };
    if (target) goal.target = target;
    if (weightage) goal.weightage = Number(weightage);
    await goal.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'GOAL_EDITED',
      entityType: 'Goal',
      entityId: goal._id,
      oldValue: oldData,
      newValue: { target: goal.target, weightage: goal.weightage },
      description: `Manager edited goal "${goal.title}" inline`
    });

    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getTeamGoals, getTeamOverview, approveGoal, rejectGoal, addComment, getComments, editGoalInline };
