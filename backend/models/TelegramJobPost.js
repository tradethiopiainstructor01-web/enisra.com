const mongoose = require('mongoose');

const TelegramJobPostSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, unique: true, index: true },
    status: { type: String, enum: ['pending', 'posted', 'failed'], default: 'pending' },
    attempts: { type: Number, default: 0 },
    telegramMessageId: Number,
    postedAt: Date,
    lastError: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TelegramJobPost', TelegramJobPostSchema);
