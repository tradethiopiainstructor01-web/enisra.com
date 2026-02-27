const express = require('express');
const {
  receiveSms,
  login,
  dashboard,
  deleteSubscriberByUsername,
  createUserWithAccessCode
} = require('../controllers/smsAuthController');
const { smsJwtAuth } = require('../middleware/smsJwtAuth');

const router = express.Router();

router.post('/create-user', createUserWithAccessCode);
router.post('/sms', receiveSms);
router.post('/login', login);
router.get('/dashboard', smsJwtAuth, dashboard);
router.delete('/subscribers/:username', deleteSubscriberByUsername);

module.exports = router;
