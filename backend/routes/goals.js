const express = require('express');
const router = express.Router();
const {
  getMyGoals, getGoal, createGoal, updateGoal,
  submitGoalSheet, deleteGoal, updateQuarterlyAchievement
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getMyGoals);
router.post('/', protect, roleCheck('employee'), createGoal);
router.post('/submit', protect, roleCheck('employee'), submitGoalSheet);
router.get('/:id', protect, getGoal);
router.put('/:id', protect, updateGoal);
router.delete('/:id', protect, deleteGoal);
router.put('/:id/quarterly', protect, roleCheck('employee'), updateQuarterlyAchievement);

module.exports = router;
