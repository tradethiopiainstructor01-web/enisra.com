const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema(
  {
    msisdn: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    pinHash: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'UNSUBSCRIBED', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true
    },
    lastSubscribedAt: {
      type: Date,
      default: Date.now
    },
    lastUnsubscribedAt: {
      type: Date,
      default: null
    },
    failedLoginCount: {
      type: Number,
      default: 0
    },
    lockedUntil: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscriber', subscriberSchema);
