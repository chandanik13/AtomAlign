const mongoose = require('mongoose');

const quarterlyUpdateSchema = new mongoose.Schema({
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  actualAchievement: { type: String, required: true },
  status: {
    type: String,
    enum: ['not_started', 'on_track', 'completed'],
    default: 'not_started'
  },
  progressScore: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('QuarterlyUpdate', quarterlyUpdateSchema);
