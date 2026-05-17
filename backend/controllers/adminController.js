const Goal = require('../models/Goal');
const GoalSheet = require('../models/GoalSheet');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalGoals = await Goal.countDocuments();
    const completedGoals = await Goal.countDocuments({ status: 'approved', progressScore: { $gte: 100 } });
    const pendingGoals = await Goal.countDocuments({ status: 'submitted' });
    const rejectedGoals = await Goal.countDocuments({ status: 'rejected' });
    const inProgressGoals = await Goal.countDocuments({ status: 'approved', progressScore: { $lt: 100 } });

    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Department statistics
    const departments = await User.distinct('department');
    const deptStats = await Promise.all(departments.filter(d => d).map(async (dept) => {
      const deptUsers = await User.find({ department: dept });
      const deptUserIds = deptUsers.map(u => u._id);
      const deptGoals = await Goal.find({ employeeId: { $in: deptUserIds } });
      const deptCompleted = deptGoals.filter(g => g.progressScore >= 100).length;
      const deptProgress = deptGoals.length > 0
        ? Math.round((deptCompleted / deptGoals.length) * 100) : 0;
      return {
        department: dept,
        totalGoals: deptGoals.length,
        completedGoals: deptCompleted,
        progress: deptProgress
      };
    }));

    // Recent activities (audit logs)
    const recentActivities = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name role');

    res.json({
      success: true,
      stats: { totalUsers, totalGoals, completedGoals, pendingGoals, rejectedGoals, inProgressGoals, completionRate },
      deptStats,
      recentActivities
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Unlock a goal
// @route   PUT /api/admin/goals/:id/unlock
const unlockGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const oldStatus = goal.status;
    goal.isLocked = false;
    goal.status = 'submitted';
    await goal.save();

    // Notify employee
    await Notification.create({
      userId: goal.employeeId,
      title: 'Goal Unlocked',
      message: `Your goal "${goal.title}" has been unlocked by Admin for editing`,
      type: 'goal_unlocked',
      relatedGoalId: goal._id
    });

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'GOAL_UNLOCKED',
      entityType: 'Goal',
      entityId: goal._id,
      oldValue: { status: oldStatus, isLocked: true },
      newValue: { status: 'submitted', isLocked: false },
      description: `Admin unlocked goal "${goal.title}"`
    });

    res.json({ success: true, goal, message: 'Goal unlocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all audit logs
// @route   GET /api/admin/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, userId } = req.query;
    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get completion dashboard (all employees)
// @route   GET /api/admin/completion
const getCompletionDashboard = async (req, res) => {
  try {
    const { cycle } = req.query;
    const goalQuery = cycle ? { cycle } : {};

    const employees = await User.find({ role: 'employee', isActive: true })
      .populate('managerId', 'name department');

    const completionData = await Promise.all(employees.map(async (emp) => {
      const goals = await Goal.find({ employeeId: emp._id, ...goalQuery });
      const totalGoals = goals.length;
      const approvedGoals = goals.filter(g => g.status === 'approved').length;
      const avgProgress = totalGoals > 0
        ? Math.round(goals.reduce((sum, g) => sum + (g.progressScore || 0), 0) / totalGoals)
        : 0;
      return {
        employee: { _id: emp._id, name: emp.name, email: emp.email, department: emp.department },
        manager: emp.managerId,
        totalGoals,
        approvedGoals,
        avgProgress,
        status: totalGoals === 0 ? 'No Goals' : approvedGoals === totalGoals ? 'Completed' : 'In Progress'
      };
    }));

    res.json({ success: true, data: completionData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all goals for reports
// @route   GET /api/admin/goals
const getAllGoals = async (req, res) => {
  try {
    const { status, cycle, department } = req.query;
    let query = {};
    if (status) query.status = status;
    if (cycle) query.cycle = cycle;

    let goals = await Goal.find(query)
      .populate('employeeId', 'name email department managerId')
      .sort({ createdAt: -1 });

    if (department) {
      goals = goals.filter(g => g.employeeId?.department === department);
    }

    res.json({ success: true, goals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getDashboard, unlockGoal, getAuditLogs, getCompletionDashboard, getAllGoals };
