const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Subscriber = require('../models/Subscriber');
const SubscriptionEvent = require('../models/SubscriptionEvent');
const SmsTransaction = require('../models/SmsTransaction');
const { smppGatewayService } = require('./smppGatewayService');
const {
  SHORT_CODE,
  normalizeKeyword,
  normalizeMsisdn,
  isValidMsisdn,
  generatePin4
} = require('../utils/subscriptionUtils');

const BCRYPT_ROUNDS = Number(process.env.SUB_PIN_BCRYPT_ROUNDS || 10);
const LOGIN_MAX_ATTEMPTS = Number(process.env.SUB_LOGIN_MAX_ATTEMPTS || 5);
const LOGIN_LOCK_MINUTES = Number(process.env.SUB_LOGIN_LOCK_MINUTES || 15);

const createEvent = async ({ subscriberId = null, msisdn, eventType, source = 'SYSTEM', metadata = {} }) => {
  return SubscriptionEvent.create({
    subscriberId,
    msisdn,
    eventType,
    source,
    metadata
  });
};

const sendSubscriptionSms = async ({ msisdn, message }) => {
  return smppGatewayService.sendSms({
    msisdn,
    text: message,
    shortCode: SHORT_CODE
  });
};

const subscribeOrHandleDuplicate = async (msisdn) => {
  let subscriber = await Subscriber.findOne({ msisdn });
  if (!subscriber) {
    const plainPin = generatePin4();
    const pinHash = await bcrypt.hash(plainPin, BCRYPT_ROUNDS);
    subscriber = await Subscriber.create({
      msisdn,
      pinHash,
      status: 'ACTIVE',
      lastSubscribedAt: new Date()
    });

    await createEvent({
      subscriberId: subscriber._id,
      msisdn,
      eventType: 'SUBSCRIBE',
      source: 'SMS'
    });

    console.log(`[SUBSCRIBE] shortCode=${SHORT_CODE} msisdn=${msisdn} pin=${plainPin}`);

    await sendSubscriptionSms({
      msisdn,
      message: `Welcome. Subscription ACTIVE on ${SHORT_CODE}. Login with MSISDN ${msisdn} and PIN ${plainPin}.`
    });

    return { outcome: 'SUBSCRIBED_NEW', subscriber };
  }

  if (subscriber.status === 'ACTIVE') {
    await sendSubscriptionSms({
      msisdn,
      message: `Already subscribed on ${SHORT_CODE}.`
    });
    return { outcome: 'ALREADY_ACTIVE', subscriber };
  }

  const newPin = generatePin4();
  subscriber.pinHash = await bcrypt.hash(newPin, BCRYPT_ROUNDS);
  subscriber.status = 'ACTIVE';
  subscriber.failedLoginCount = 0;
  subscriber.lockedUntil = null;
  subscriber.lastSubscribedAt = new Date();
  await subscriber.save();

  await createEvent({
    subscriberId: subscriber._id,
    msisdn,
    eventType: 'RESUBSCRIBE',
    source: 'SMS'
  });

  await createEvent({
    subscriberId: subscriber._id,
    msisdn,
    eventType: 'PIN_ROTATE',
    source: 'SYSTEM',
    metadata: { reason: 'RESUBSCRIBE' }
  });

  console.log(`[RESUBSCRIBE] shortCode=${SHORT_CODE} msisdn=${msisdn} pin=${newPin}`);

  await sendSubscriptionSms({
    msisdn,
    message: `Subscription reactivated. Login PIN: ${newPin}`
  });

  return { outcome: 'RESUBSCRIBED', subscriber };
};

const unsubscribeSubscriber = async (msisdn, source = 'SMS') => {
  const subscriber = await Subscriber.findOne({ msisdn });
  if (!subscriber) {
    await sendSubscriptionSms({
      msisdn,
      message: `You are not subscribed on ${SHORT_CODE}.`
    });
    return { outcome: 'NOT_FOUND' };
  }

  await createEvent({
    subscriberId: subscriber._id,
    msisdn,
    eventType: 'UNSUBSCRIBE',
    source
  });

  await Subscriber.deleteOne({ _id: subscriber._id });

  await sendSubscriptionSms({
    msisdn,
    message: `You are unsubscribed from ${SHORT_CODE} and removed from the system.`
  });

  return { outcome: 'UNSUBSCRIBED_AND_DELETED' };
};

const provisionLoginCredentials = async (rawMsisdn) => {
  const msisdn = normalizeMsisdn(rawMsisdn);
  if (!isValidMsisdn(msisdn)) {
    return {
      success: false,
      statusCode: 400,
      message: 'Phone number must start with 09 or 251 and be valid.'
    };
  }

  const plainPin = generatePin4();
  const pinHash = await bcrypt.hash(plainPin, BCRYPT_ROUNDS);

  let subscriber = await Subscriber.findOne({ msisdn });
  if (!subscriber) {
    subscriber = await Subscriber.create({
      msisdn,
      pinHash,
      status: 'ACTIVE',
      lastSubscribedAt: new Date()
    });
    await createEvent({
      subscriberId: subscriber._id,
      msisdn,
      eventType: 'SUBSCRIBE',
      source: 'WEB'
    });
  } else {
    subscriber.pinHash = pinHash;
    subscriber.status = 'ACTIVE';
    subscriber.failedLoginCount = 0;
    subscriber.lockedUntil = null;
    subscriber.lastSubscribedAt = new Date();
    await subscriber.save();
    await createEvent({
      subscriberId: subscriber._id,
      msisdn,
      eventType: 'PIN_ROTATE',
      source: 'WEB',
      metadata: { reason: 'WEB_PROVISION' }
    });
  }

  console.log(`[WEB_PROVISION] shortCode=${SHORT_CODE} msisdn=${msisdn} pin=${plainPin}`);

  return {
    success: true,
    statusCode: 200,
    message: 'Credentials generated successfully.',
    credentials: {
      msisdn,
      pin: plainPin
    }
  };
};

const handleIncomingMo = async ({ msisdn: rawMsisdn, text = '', shortCode = SHORT_CODE, rawPdu = null }) => {
  const msisdn = normalizeMsisdn(rawMsisdn);
  const keyword = normalizeKeyword(text);

  await SmsTransaction.create({
    direction: 'MO',
    msisdn: msisdn || rawMsisdn || 'UNKNOWN',
    shortCode: shortCode || SHORT_CODE,
    keyword,
    text,
    status: 'RECEIVED',
    metadata: rawPdu ? { rawPdu } : {}
  });

  if (!isValidMsisdn(msisdn)) {
    return { success: false, message: 'Invalid MSISDN format.' };
  }

  if (keyword === 'START') {
    const result = await subscribeOrHandleDuplicate(msisdn);
    return { success: true, ...result };
  }

  if (keyword === 'STOP') {
    const result = await unsubscribeSubscriber(msisdn, 'SMS');
    return { success: true, ...result };
  }

  await createEvent({
    msisdn,
    eventType: 'INVALID_KEYWORD',
    source: 'SMS',
    metadata: { text }
  });

  await sendSubscriptionSms({
    msisdn,
    message: 'Invalid keyword. Send START to subscribe or STOP to unsubscribe.'
  });

  return { success: false, message: 'Invalid keyword' };
};

const handleDeliveryReceipt = async ({ messageId, status, errorCode, rawText }) => {
  if (messageId) {
    const mt = await SmsTransaction.findOne({ messageId }).sort({ createdAt: -1 });
    if (mt) {
      mt.status = status === 'DELIVRD' ? 'DELIVERED' : 'FAILED';
      mt.errorCode = errorCode || mt.errorCode;
      mt.deliveredAt = new Date();
      mt.metadata = {
        ...(mt.metadata || {}),
        dlrRaw: rawText
      };
      await mt.save();
    }
  }
};

const loginSubscriber = async ({ msisdn: rawMsisdn, pin, ip = '' }) => {
  const msisdn = normalizeMsisdn(rawMsisdn);
  if (!isValidMsisdn(msisdn)) {
    return { success: false, statusCode: 400, message: 'Invalid MSISDN format.' };
  }

  if (!/^\d{4}$/.test(String(pin || ''))) {
    return { success: false, statusCode: 400, message: 'PIN must be exactly 4 digits.' };
  }

  const subscriber = await Subscriber.findOne({ msisdn });
  if (!subscriber) {
    await createEvent({
      msisdn,
      eventType: 'LOGIN_FAIL',
      source: 'WEB',
      metadata: { reason: 'NOT_FOUND', ip }
    });
    return { success: false, statusCode: 401, message: 'Invalid credentials.' };
  }

  if (subscriber.status !== 'ACTIVE') {
    await createEvent({
      subscriberId: subscriber._id,
      msisdn,
      eventType: 'LOGIN_FAIL',
      source: 'WEB',
      metadata: { reason: 'INACTIVE_STATUS', status: subscriber.status, ip }
    });
    return { success: false, statusCode: 403, message: 'Subscription is not active.' };
  }

  if (subscriber.lockedUntil && subscriber.lockedUntil > new Date()) {
    return { success: false, statusCode: 429, message: 'Account temporarily locked. Try again later.' };
  }

  const isMatch = await bcrypt.compare(String(pin), subscriber.pinHash);
  if (!isMatch) {
    subscriber.failedLoginCount += 1;
    if (subscriber.failedLoginCount >= LOGIN_MAX_ATTEMPTS) {
      subscriber.lockedUntil = new Date(Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000);
      subscriber.failedLoginCount = 0;
    }
    await subscriber.save();

    await createEvent({
      subscriberId: subscriber._id,
      msisdn,
      eventType: 'LOGIN_FAIL',
      source: 'WEB',
      metadata: { reason: 'PIN_MISMATCH', ip }
    });

    return { success: false, statusCode: 401, message: 'Invalid credentials.' };
  }

  subscriber.failedLoginCount = 0;
  subscriber.lockedUntil = null;
  await subscriber.save();

  await createEvent({
    subscriberId: subscriber._id,
    msisdn,
    eventType: 'LOGIN_SUCCESS',
    source: 'WEB',
    metadata: { ip }
  });

  const token = jwt.sign(
    {
      msisdn,
      type: 'subscription_access'
    },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '8h' }
  );

  return {
    success: true,
    statusCode: 200,
    message: 'Login successful.',
    token,
    user: {
      msisdn,
      status: subscriber.status
    }
  };
};

const getDashboardPayload = (msisdn) => ({
  success: true,
  user: { msisdn },
  actions: [
    {
      id: 'scholarship',
      title: 'Apply for Scholarship',
      description: 'Start or continue your scholarship application process.'
    },
    {
      id: 'free-training',
      title: 'Join Free Training',
      description: 'Browse available free training courses and enroll.'
    }
  ]
});

const getSubscriptionStatus = async (rawMsisdn) => {
  const msisdn = normalizeMsisdn(rawMsisdn);
  if (!isValidMsisdn(msisdn)) return null;
  return Subscriber.findOne({ msisdn }).select('msisdn status lastSubscribedAt lastUnsubscribedAt');
};

const initSmppHandlers = () => {
  smppGatewayService.onMo(handleIncomingMo);
  smppGatewayService.onDlr(handleDeliveryReceipt);
  smppGatewayService.start();
};

module.exports = {
  initSmppHandlers,
  handleIncomingMo,
  handleDeliveryReceipt,
  loginSubscriber,
  provisionLoginCredentials,
  unsubscribeSubscriber,
  getDashboardPayload,
  getSubscriptionStatus
};
