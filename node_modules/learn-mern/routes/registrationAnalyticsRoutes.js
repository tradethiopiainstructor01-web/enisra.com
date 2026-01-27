const express = require('express');
const {
  createRegistrationEvent,
  getRegistrationSummary,
} = require('../controllers/registrationAnalyticsController');

const router = express.Router();

router.post('/', createRegistrationEvent);
router.get('/summary', getRegistrationSummary);

module.exports = router;
