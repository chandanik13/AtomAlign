const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['goal_submitted', 'goal_approved', 'goal_rejected', 'check_in_reminder',
           'manager_comment', 'goal_locked', 'goal_unlocked', 'general'],
    default: 'general'
  },
  isRead: { type: Boolean, default: false },
  relatedGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
