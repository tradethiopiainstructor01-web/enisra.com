const express = require('express');
const {
  provisionCredentials,
  loginWithPin,
  getScholarshipDashboard,
  unsubscribeByApi,
  getSubscriberStatus,
  simulateMo
} = require('../controllers/scholarshipAuthController');
const { scholarshipProtect } = require('../middleware/scholarshipAuth');

const router = express.Router();

router.post('/provision', provisionCredentials);
router.post('/login', loginWithPin);
router.get('/dashboard', scholarshipProtect, getScholarshipDashboard);
router.post('/unsubscribe', unsubscribeByApi);
router.get('/status/:msisdn', getSubscriberStatus);
router.post('/simulate-mo', simulateMo);

module.exports = router;
