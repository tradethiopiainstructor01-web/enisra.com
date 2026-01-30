const express = require('express');
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

const router = express.Router();

router.get('/', jobController.listJobs);
router.post('/', protect, authorizeRoles('employer', 'admin'), jobController.createJob);
router.get('/pending', protect, authorizeRoles('admin'), jobController.listPendingJobs);
router.patch('/:id/approve', protect, authorizeRoles('admin'), jobController.approveJob);
router.patch('/:id/reject', protect, authorizeRoles('admin'), jobController.rejectJob);

module.exports = router;
