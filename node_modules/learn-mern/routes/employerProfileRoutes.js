const express = require('express');
const router = express.Router();
const { getEmployerProfile } = require('../controllers/employerProfileController');

router.get('/', getEmployerProfile);

module.exports = router;
