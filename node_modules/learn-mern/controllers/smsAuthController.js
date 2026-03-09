const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SmsSubscription = require('../models/SmsSubscription');
const ScholarshipContent = require('../models/ScholarshipContent');

const SHORT_CODE = '9295';
const BCRYPT_ROUNDS = Number(process.env.SMS_PIN_BCRYPT_ROUNDS || 10);
const KEYWORD_PATTERN = /^(OK|STOP)$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = Number(process.env.SMS_PASSWORD_MIN_LENGTH || 6);
const PASSWORD_MAX_LENGTH = Number(process.env.SMS_PASSWORD_MAX_LENGTH || 64);

const normalizeMsisdn = (value = '') => {
  const digits = value.toString().replace(/\D/g, '');
  if (/^09\d{8}$/.test(digits)) return `251${digits.slice(1)}`;
  if (/^251\d{9}$/.test(digits)) return digits;
  return digits;
};

const isSupportedMsisdnInput = (value = '') => /^(?:09\d{8}|251\d{9})$/.test(value.toString().replace(/\D/g, ''));

const generatePin6 = () => String(Math.floor(100000 + Math.random() * 900000));

const normalizeCredential = (value = '') => value.toString().trim();

const isValidCredential = (value = '') =>
  value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;

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

const upsertSubscriberCredential = async ({ msisdn, password }) => {
  const pinHash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);

  return SmsSubscription.findOneAndUpdate(
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
      const subscriber = await upsertSubscriberCredential({
        msisdn,
        password: pin
      });

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
    const password = normalizeCredential(req.body?.password ?? req.body?.pin);

    if (!isSupportedMsisdnInput(rawMsisdn)) {
      return res.status(400).json({
        success: false,
        message: 'MSISDN must start with 09 or 251 and be valid.'
      });
    }

    if (!isValidCredential(password)) {
      return res.status(400).json({
        success: false,
        message: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`
      });
    }

    const msisdn = normalizeMsisdn(rawMsisdn);
    const subscriber = await SmsSubscription.findOne({ msisdn });

    if (!subscriber) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password.'
      });
    }

    if (subscriber.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Subscription is inactive. Send OK to 9295.'
      });
    }

    const validPassword = await bcrypt.compare(password, subscriber.pinHash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password.'
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
  try {
    const items = await ScholarshipContent.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean();

    const scholarshipPosts = items.filter((item) => item.type === 'scholarship');
    const freeTrainingPosts = items.filter((item) => item.type === 'free-training');

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
      ],
      scholarshipPosts,
      freeTrainingPosts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard.'
    });
  }
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
    const normalizedPassword = normalizeCredential(password);

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

    if (!isValidCredential(normalizedPassword)) {
      return res.status(400).json({
        success: false,
        error: `password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`
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
    await upsertSubscriberCredential({
      msisdn,
      password: normalizedPassword
    });

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

const createSubscriberByAdmin = async (req, res) => {
  try {
    const rawMsisdn = req.body?.phoneNumber || req.body?.msisdn || req.body?.username || '';
    const password = normalizeCredential(req.body?.password);

    if (!isSupportedMsisdnInput(rawMsisdn)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must start with 09 or 251 and be valid.'
      });
    }

    if (!isValidCredential(password)) {
      return res.status(400).json({
        success: false,
        message: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`
      });
    }

    const msisdn = normalizeMsisdn(rawMsisdn);
    const existingSubscriber = await SmsSubscription.findOne({ msisdn }).lean();
    const subscriber = await upsertSubscriberCredential({ msisdn, password });

    return res.json({
      success: true,
      message: existingSubscriber ? 'SMS scholar account updated.' : 'SMS scholar account created.',
      data: {
        created: !existingSubscriber,
        subscriber: {
          msisdn: subscriber.msisdn,
          phoneNumber: toLocalUsername(subscriber.msisdn),
          status: subscriber.status
        },
        credentials: {
          phoneNumber: toLocalUsername(subscriber.msisdn),
          password
        }
      }
    });
  } catch (error) {
    console.error('createSubscriberByAdmin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create SMS scholar account.'
    });
  }
};

const listSubscribersByAdmin = async (req, res) => {
  try {
    const subscribers = await SmsSubscription.find({})
      .sort({ createdAt: -1 })
      .select('msisdn status createdAt updatedAt')
      .lean();

    return res.json({
      success: true,
      data: subscribers.map((subscriber) => ({
        msisdn: subscriber.msisdn,
        phoneNumber: toLocalUsername(subscriber.msisdn),
        status: subscriber.status,
        createdAt: subscriber.createdAt,
        updatedAt: subscriber.updatedAt
      }))
    });
  } catch (error) {
    console.error('listSubscribersByAdmin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load SMS scholar accounts.'
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
      success: true,
      message: 'Subscriber deleted successfully.',
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
  createUserWithAccessCode,
  createSubscriberByAdmin,
  listSubscribersByAdmin
};
