const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SmsSubscription = require('../models/SmsSubscription');

const SHORT_CODE = '9295';
const BCRYPT_ROUNDS = Number(process.env.SMS_PIN_BCRYPT_ROUNDS || 10);
const PIN_PATTERN = /^\d{6}$/;
const KEYWORD_PATTERN = /^(OK|STOP)$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeMsisdn = (value = '') => {
  const digits = value.toString().replace(/\D/g, '');
  if (/^09\d{8}$/.test(digits)) return `251${digits.slice(1)}`;
  if (/^251\d{9}$/.test(digits)) return digits;
  return digits;
};

const isSupportedMsisdnInput = (value = '') => /^(?:09\d{8}|251\d{9})$/.test(value.toString().replace(/\D/g, ''));

const generatePin6 = () => String(Math.floor(100000 + Math.random() * 900000));

const toLocalUsername = (normalizedMsisdn = '') => {
  if (/^251\d{9}$/.test(normalizedMsisdn)) {
    return `0${normalizedMsisdn.slice(3)}`;
  }
  return normalizedMsisdn;
};

const buildSubscriberJson = ({ normalizedMsisdn, pin = '' }) => {
  const username = toLocalUsername(normalizedMsisdn);
  return {
    username,
    password: pin,
    email: `${username}@enisra.com`,
    roles: ['subscriber']
  };
};

const safeEqual = (a = '', b = '') => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
};

const receiveSms = async (req, res) => {
  try {
    const rawMsisdn = req.body?.msisdn || '';
    const message = (req.body?.message || '').toString().trim();

    if (!isSupportedMsisdnInput(rawMsisdn)) {
      return res.status(400).json({
        success: false,
        message: 'MSISDN must start with 09 or 251 and be valid.'
      });
    }

    if (!KEYWORD_PATTERN.test(message)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid keyword. Use OK or STOP.'
      });
    }

    const msisdn = normalizeMsisdn(rawMsisdn);
    const keyword = message.toUpperCase();

    if (keyword === 'OK') {
      const pin = generatePin6();
      const pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);

      const subscriber = await SmsSubscription.findOneAndUpdate(
        { msisdn },
        {
          $set: {
            pinHash,
            status: 'ACTIVE',
            lastKeyword: 'OK',
            lastKeywordAt: new Date()
          }
        },
        {
          new: true,
          upsert: true
        }
      );

      // Testing visibility in terminal (remove in production).
      console.log(`[SMS OK] shortCode=${SHORT_CODE} msisdn=${subscriber.msisdn} pin=${pin}`);

      const credentialsMessage = `Subscribed successfully. Your login credentials phone number is ${subscriber.msisdn} and your PIN is ${pin}. Do not share your credentials.`;
      console.log(`[SMS MESSAGE] ${credentialsMessage}`);

      return res.json({
        user: buildSubscriberJson({
          normalizedMsisdn: subscriber.msisdn,
          pin
        })
      });
    }

    const subscriber = await SmsSubscription.findOne({ msisdn });
    if (!subscriber) {
      return res.json({
        success: true,
        action: 'STOP',
        shortCode: SHORT_CODE,
        message: 'Subscriber not found. No active subscription.'
      });
    }

    subscriber.status = 'INACTIVE';
    subscriber.lastKeyword = 'STOP';
    subscriber.lastKeywordAt = new Date();
    await subscriber.save();

    console.log(`[SMS STOP] shortCode=${SHORT_CODE} msisdn=${subscriber.msisdn}`);

    return res.json({
      user: buildSubscriberJson({
        normalizedMsisdn: subscriber.msisdn,
        pin: ''
      })
    });
  } catch (error) {
    console.error('receiveSms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process SMS request.'
    });
  }
};

const login = async (req, res) => {
  try {
    const rawMsisdn = req.body?.msisdn || '';
    const pin = (req.body?.pin || '').toString().trim();

    if (!isSupportedMsisdnInput(rawMsisdn)) {
      return res.status(400).json({
        success: false,
        message: 'MSISDN must start with 09 or 251 and be valid.'
      });
    }

    if (!PIN_PATTERN.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be exactly 6 digits.'
      });
    }

    const msisdn = normalizeMsisdn(rawMsisdn);
    const subscriber = await SmsSubscription.findOne({ msisdn });

    if (!subscriber) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    if (subscriber.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Subscription is inactive. Send OK to 9295.'
      });
    }

    const validPin = await bcrypt.compare(pin, subscriber.pinHash);
    if (!validPin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const token = jwt.sign(
      {
        msisdn: subscriber.msisdn,
        type: 'sms_subscription_auth'
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token
    });
  } catch (error) {
    console.error('sms login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to login.'
    });
  }
};

const dashboard = async (req, res) => {
  return res.json({
    success: true,
    msisdn: req.smsUser.msisdn,
    actions: [
      {
        id: 'scholarship',
        title: 'Apply for Scholarship',
        description: 'Open scholarship application page.'
      },
      {
        id: 'free-training',
        title: 'Join Free Training',
        description: 'Open free training courses page.'
      }
    ]
  });
};

const createUserWithAccessCode = async (req, res) => {
  try {
    const providedAccessCode = req.headers['x-access-code'];
    const expectedAccessCode = process.env.CREATE_USER_ACCESS_CODE || '';

    if (!expectedAccessCode || !safeEqual(providedAccessCode || '', expectedAccessCode)) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized request.'
      });
    }

    const { username, password, email, roles } = req.body || {};

    if (!username || !password || !email || !Array.isArray(roles)) {
      return res.status(400).json({
        success: false,
        error: 'username, password, email and roles are required.'
      });
    }

    if (!isSupportedMsisdnInput(username)) {
      return res.status(400).json({
        success: false,
        error: 'username must be a valid phone number starting with 09 or 251.'
      });
    }

    if (!PIN_PATTERN.test(String(password))) {
      return res.status(400).json({
        success: false,
        error: 'password must be exactly 6 digits.'
      });
    }

    if (!EMAIL_PATTERN.test(String(email))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format.'
      });
    }

    if (!roles.includes('subscriber')) {
      return res.status(400).json({
        success: false,
        error: 'roles must include subscriber.'
      });
    }

    const msisdn = normalizeMsisdn(username);
    const pinHash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);

    await SmsSubscription.findOneAndUpdate(
      { msisdn },
      {
        $set: {
          pinHash,
          status: 'ACTIVE',
          lastKeyword: 'OK',
          lastKeywordAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      data: {
        user: {
          username: toLocalUsername(msisdn),
          email,
          roles: ['subscriber']
        }
      }
    });
  } catch (error) {
    console.error('createUserWithAccessCode error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create user.'
    });
  }
};

const deleteSubscriberByUsername = async (req, res) => {
  try {
    const username = (req.params?.username || '').toString().trim();
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required.'
      });
    }

    if (!isSupportedMsisdnInput(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be a valid phone format starting with 09 or 251.'
      });
    }

    const normalizedMsisdn = normalizeMsisdn(username);
    const deleted = await SmsSubscription.findOneAndDelete({ msisdn: normalizedMsisdn });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found.'
      });
    }

    return res.json({
      user: buildSubscriberJson({
        normalizedMsisdn: deleted.msisdn,
        pin: ''
      })
    });
  } catch (error) {
    console.error('deleteSubscriberByUsername error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber.'
    });
  }
};

module.exports = {
  receiveSms,
  login,
  dashboard,
  deleteSubscriberByUsername,
  createUserWithAccessCode
};
