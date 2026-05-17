const mongoose = require('mongoose');

const goalSheetSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cycle: { type: String, default: '2024-25' },
  goals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }],
  totalWeightage: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected', 'locked'],
    default: 'draft'
  },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
  overallProgress: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('GoalSheet', goalSheetSchema);
