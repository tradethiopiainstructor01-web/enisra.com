const mongoose = require('mongoose');

const smsSubscriptionSchema = new mongoose.Schema(
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
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true
    },
    lastKeyword: {
      type: String,
      default: 'START'
    },
    lastKeywordAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SmsSubscription', smsSubscriptionSchema);
