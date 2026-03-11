const express = require('express');
const telegramController = require('../controllers/telegramController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

const router = express.Router();

router.post('/webhook', telegramController.webhook);
router.get('/debug', protect, authorizeRoles('admin'), telegramController.debugStatus);
router.post('/set-webhook', protect, authorizeRoles('admin'), telegramController.setWebhook);

module.exports = router;
