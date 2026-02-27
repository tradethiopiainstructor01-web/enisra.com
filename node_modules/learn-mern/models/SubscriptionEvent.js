const mongoose = require('mongoose');

const subscriptionEventSchema = new mongoose.Schema(
  {
    subscriberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscriber',
      default: null,
      index: true
    },
    msisdn: {
      type: String,
      required: true,
      index: true
    },
    eventType: {
      type: String,
      enum: [
        'SUBSCRIBE',
        'RESUBSCRIBE',
        'UNSUBSCRIBE',
        'INVALID_KEYWORD',
        'LOGIN_SUCCESS',
        'LOGIN_FAIL',
        'PIN_ROTATE'
      ],
      required: true
    },
    source: {
      type: String,
      enum: ['SMS', 'WEB', 'API', 'SYSTEM'],
      default: 'SYSTEM'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionEvent', subscriptionEventSchema);
