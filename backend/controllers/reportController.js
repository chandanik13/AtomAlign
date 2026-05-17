const Goal = require('../models/Goal');
const User = require('../models/User');

// @desc    Get achievement report
// @route   GET /api/reports
const getReport = async (req, res) => {
  try {
    const { cycle, department, status, quarter } = req.query;

    let goals = await Goal.find(cycle ? { cycle } : {})
      .populate({
        path: 'employeeId',
        select: 'name email department managerId',
        populate: { path: 'managerId', select: 'name' }
      })
      .sort({ createdAt: -1 });

    // Filter by department
    if (department) {
      goals = goals.filter(g => g.employeeId?.department === department);
    }
    if (status) {
      goals = goals.filter(g => g.status === status);
    }

    const reportData = goals.map(goal => {
      const quarterlyUpdate = quarter
        ? goal.quarterlyUpdates?.find(q => q.quarter === quarter)
        : null;

      return {
        goalId: goal._id,
        goalTitle: goal.title,
        thrustArea: goal.thrustArea,
        employeeName: goal.employeeId?.name || 'N/A',
        employeeEmail: goal.employeeId?.email || 'N/A',
        department: goal.employeeId?.department || 'N/A',
        managerName: goal.employeeId?.managerId?.name || 'N/A',
        uomType: goal.uomType,
        target: goal.target,
        actualAchievement: quarterlyUpdate?.achievement || goal.actualAchievement || 'N/A',
        progressScore: goal.progressScore || 0,
        weightage: goal.weightage,
        status: goal.status,
        quarter: quarterlyUpdate?.quarter || 'Overall',
        quarterStatus: quarterlyUpdate?.status || 'N/A',
        cycle: goal.cycle,
        createdAt: goal.createdAt
      };
    });

    res.json({ success: true, data: reportData, total: reportData.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get department summary
// @route   GET /api/reports/departments
const getDeptSummary = async (req, res) => {
  try {
    const departments = await User.distinct('department');
    const summary = await Promise.all(departments.filter(d => d).map(async (dept) => {
      const users = await User.find({ department: dept });
      const userIds = users.map(u => u._id);
      const goals = await Goal.find({ employeeId: { $in: userIds } });
      const totalGoals = goals.length;
      const completedGoals = goals.filter(g => g.progressScore >= 100).length;
      const avgProgress = totalGoals > 0
        ? Math.round(goals.reduce((sum, g) => sum + (g.progressScore || 0), 0) / totalGoals)
        : 0;
      return { department: dept, totalGoals, completedGoals, avgProgress, employees: users.length };
    }));

    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getReport, getDeptSummary };
