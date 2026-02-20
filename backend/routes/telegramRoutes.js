const express = require('express');
const telegramController = require('../controllers/telegramController');

const router = express.Router();

router.post('/webhook', telegramController.webhook);
router.post('/set-webhook', telegramController.setWebhook);

module.exports = router;
