const mongoose = require('mongoose');

const deletedSmsSubscriptionSchema = new mongoose.Schema(
  {
    msisdn: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    deletedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeletedSmsSubscription', deletedSmsSubscriptionSchema);
