const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalSheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'GoalSheet' },
  thrustArea: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  uomType: {
    type: String,
    enum: ['numeric', 'percentage', 'timeline', 'zero-based'],
    required: true
  },
  target: { type: String, required: true },
  targetDate: { type: Date },
  weightage: { type: Number, required: true, min: 10, max: 100 },
  actualAchievement: { type: String, default: '' },
  quarterlyUpdates: [{
    quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'] },
    achievement: String,
    status: { type: String, enum: ['not_started', 'on_track', 'completed'], default: 'not_started' },
    updatedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected', 'locked'],
    default: 'draft'
  },
  progressScore: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  isSharedGoal: { type: Boolean, default: false },
  sharedGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'SharedGoal', default: null },
  managerComments: [{
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  rejectionReason: { type: String, default: '' },
  cycle: { type: String, default: '2024-25' }
}, { timestamps: true });

// Calculate progress score based on UOM type
goalSchema.methods.calculateProgressScore = function () {
  if (!this.actualAchievement || !this.target) return 0;
  
  const actual = parseFloat(this.actualAchievement);
  const target = parseFloat(this.target);
  
  if (isNaN(actual) || isNaN(target) || target === 0) return 0;

  switch (this.uomType) {
    case 'numeric':
      return Math.min(Math.round((actual / target) * 100), 100);
    case 'percentage':
      return Math.min(Math.round((actual / target) * 100), 100);
    case 'zero-based':
      return actual === 0 ? 100 : 0;
    case 'timeline':
      if (!this.targetDate) return 0;
      const today = new Date();
      const deadline = new Date(this.targetDate);
      const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      return daysLeft >= 0 ? Math.min(actual, 100) : 0;
    default:
      return 0;
  }
};

module.exports = mongoose.model('Goal', goalSchema);
