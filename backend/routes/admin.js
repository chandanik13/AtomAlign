const express = require('express');
const router = express.Router();
const { getDashboard, unlockGoal, getAuditLogs, getCompletionDashboard, getAllGoals } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/dashboard', protect, roleCheck('admin'), getDashboard);
router.get('/goals', protect, roleCheck('admin'), getAllGoals);
router.put('/goals/:id/unlock', protect, roleCheck('admin'), unlockGoal);
router.get('/audit-logs', protect, roleCheck('admin'), getAuditLogs);
router.get('/completion', protect, roleCheck('admin'), getCompletionDashboard);

module.exports = router;
