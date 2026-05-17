const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  userRole: { type: String },
  action: {
    type: String,
    enum: [
      'GOAL_CREATED', 'GOAL_SUBMITTED', 'GOAL_APPROVED', 'GOAL_REJECTED',
      'GOAL_EDITED', 'GOAL_LOCKED', 'GOAL_UNLOCKED', 'GOAL_DELETED',
      'QUARTERLY_UPDATED', 'MANAGER_COMMENT_ADDED', 'USER_CREATED',
      'USER_UPDATED', 'USER_DELETED', 'LOGIN', 'SHARED_GOAL_CREATED',
      'SHARED_GOAL_ASSIGNED'
    ],
    required: true
  },
  entityType: { type: String, default: 'Goal' },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  description: { type: String },
  ipAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
