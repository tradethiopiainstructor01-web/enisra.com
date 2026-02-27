const mongoose = require('mongoose');

const smsTransactionSchema = new mongoose.Schema(
  {
    direction: {
      type: String,
      enum: ['MO', 'MT', 'DLR'],
      required: true,
      index: true
    },
    messageId: {
      type: String,
      default: null,
      index: true
    },
    relatedMessageId: {
      type: String,
      default: null,
      index: true
    },
    msisdn: {
      type: String,
      required: true,
      index: true
    },
    shortCode: {
      type: String,
      default: '9295'
    },
    keyword: {
      type: String,
      default: null
    },
    text: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['RECEIVED', 'SENT', 'DELIVERED', 'FAILED', 'UNKNOWN'],
      default: 'UNKNOWN',
      index: true
    },
    errorCode: {
      type: String,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    deliveredAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SmsTransaction', smsTransactionSchema);
