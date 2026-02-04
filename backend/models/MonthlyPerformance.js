const mongoose = require('mongoose');

const monthlyPerformanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    department: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    month: {
      type: String, // YYYY-MM
      required: true,
      index: true,
    },
    target: {
      type: Number,
      default: 0,
    },
    actual: {
      type: Number,
      default: 0,
    },
    taskTarget: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    contentTarget: {
      type: Number,
      default: 0,
    },
    actualAchievements: {
      type: Number,
      default: 0,
    },
    salesTarget: {
      type: Number,
      default: 0,
    },
    actualSales: {
      type: Number,
      default: 0,
    },
    targetServiceTime: {
      type: Number,
      default: 0,
    },
    actualServiceTime: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    calculatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

monthlyPerformanceSchema.index({ employeeId: 1, month: 1 });

module.exports = mongoose.model('MonthlyPerformance', monthlyPerformanceSchema);
