const {
  handleIncomingMo,
  loginSubscriber,
  provisionLoginCredentials,
  unsubscribeSubscriber,
  getDashboardPayload,
  getSubscriptionStatus
} = require('../services/subscriptionService');
const { SHORT_CODE } = require('../utils/subscriptionUtils');

const provisionCredentials = async (req, res) => {
  try {
    const { msisdn } = req.body || {};
    const result = await provisionLoginCredentials(msisdn);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('provisionCredentials error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate credentials.'
    });
  }
};

const loginWithPin = async (req, res) => {
  try {
    const { msisdn, pin } = req.body || {};
    const result = await loginSubscriber({
      msisdn,
      pin,
      ip: req.ip
    });
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('loginWithPin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process login request.'
    });
  }
};

const getScholarshipDashboard = async (req, res) => {
  try {
    const msisdn = req.scholarshipUser?.msisdn || req.scholarshipUser?.phoneNumber;
    return res.json(getDashboardPayload(msisdn));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard.'
    });
  }
};

const unsubscribeByApi = async (req, res) => {
  try {
    const { msisdn } = req.body || {};
    const result = await unsubscribeSubscriber(msisdn, 'API');
    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('unsubscribeByApi error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe.'
    });
  }
};

const getSubscriberStatus = async (req, res) => {
  try {
    const { msisdn } = req.params;
    const subscriber = await getSubscriptionStatus(msisdn);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found.'
      });
    }
    return res.json({
      success: true,
      subscriber
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch status.'
    });
  }
};

const simulateMo = async (req, res) => {
  try {
    const { msisdn, text } = req.body || {};
    const result = await handleIncomingMo({
      msisdn,
      text,
      shortCode: SHORT_CODE
    });
    return res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('simulateMo error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process simulated MO.'
    });
  }
};

module.exports = {
  provisionCredentials,
  loginWithPin,
  getScholarshipDashboard,
  unsubscribeByApi,
  getSubscriberStatus,
  simulateMo
};
