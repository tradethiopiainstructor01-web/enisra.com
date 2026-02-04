const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema(
  {
    month: {
      type: String, // YYYY-MM
      required: true,
      index: true,
    },
    department: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    awardType: {
      type: String,
      default: 'Department Winner',
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Award', awardSchema);
