const express = require('express');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const {
  getMyEmployerDetails,
  upsertMyEmployerDetails,
} = require('../controllers/employerDetailsController');

const router = express.Router();

router.get('/me', protect, authorizeRoles('employer', 'admin'), getMyEmployerDetails);
router.put('/me', protect, authorizeRoles('employer', 'admin'), upsertMyEmployerDetails);

module.exports = router;
