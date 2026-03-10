const express = require('express');
const {
  receiveSms,
  login,
  dashboard,
  deleteSubscriberByUsername,
  createUserWithAccessCode,
  createSubscriberByAdmin,
  listSubscribersByAdmin,
  listDeletedSubscribersByAdmin
} = require('../controllers/smsAuthController');
const { smsJwtAuth } = require('../middleware/smsJwtAuth');

const router = express.Router();

router.get('/admin/sms-accounts', listSubscribersByAdmin);
router.get('/admin/sms-accounts/deleted', listDeletedSubscribersByAdmin);
router.post('/admin/sms-accounts', createSubscriberByAdmin);
router.delete('/admin/sms-accounts/:username', deleteSubscriberByUsername);
router.post('/create-user', createUserWithAccessCode);
router.post('/sms', receiveSms);
router.post('/login', login);
router.get('/dashboard', smsJwtAuth, dashboard);
router.delete('/subscribers/:username', deleteSubscriberByUsername);

module.exports = router;
