const mongoose = require('mongoose');

const favoriteJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure a user can only favorite a job once
favoriteJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('FavoriteJob', favoriteJobSchema);