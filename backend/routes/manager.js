const express = require('express');
const router = express.Router();
const {
  getTeamGoals, getTeamOverview, approveGoal, rejectGoal,
  addComment, getComments, editGoalInline
} = require('../controllers/managerController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const managerOrAdmin = roleCheck('manager', 'admin');

router.get('/goals', protect, managerOrAdmin, getTeamGoals);
router.get('/team', protect, managerOrAdmin, getTeamOverview);
router.put('/goals/:id/approve', protect, managerOrAdmin, approveGoal);
router.put('/goals/:id/reject', protect, managerOrAdmin, rejectGoal);
router.put('/goals/:id/edit', protect, managerOrAdmin, editGoalInline);
router.post('/goals/:id/comment', protect, managerOrAdmin, addComment);
router.get('/goals/:id/comments', protect, getComments);

module.exports = router;
