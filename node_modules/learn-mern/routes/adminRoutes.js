const express = require('express');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const {
  listPendingEmployers,
  approveEmployer,
  rejectEmployer,
} = require('../controllers/adminApprovalController');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/employers/pending', listPendingEmployers);
router.patch('/employers/:id/approve', approveEmployer);
router.patch('/employers/:id/reject', rejectEmployer);

module.exports = router;
