const mongoose = require('mongoose');

const sharedGoalSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  thrustArea: { type: String, required: true },
  uomType: { type: String, enum: ['numeric', 'percentage', 'timeline', 'zero-based'], required: true },
  target: { type: String, required: true },
  targetDate: { type: Date },
  department: { type: String },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  primaryOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actualAchievement: { type: String, default: '' },
  cycle: { type: String, default: '2024-25' }
}, { timestamps: true });

module.exports = mongoose.model('SharedGoal', sharedGoalSchema);
