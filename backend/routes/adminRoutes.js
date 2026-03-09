const express = require('express');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const {
  listPendingEmployers,
  approveEmployer,
  rejectEmployer,
} = require('../controllers/adminApprovalController');

const router = express.Router();

router.use((req, res, next) => {
  const isSmsAccountCreate = req.method === 'POST' && req.path === '/sms-accounts';
  const isSmsAccountDelete =
    req.method === 'DELETE' && /^\/sms-accounts\/[^/]+$/.test(req.path);

  // Allow Postman/testing access for SMS account create/delete without admin auth.
  if (isSmsAccountCreate || isSmsAccountDelete) {
    return next();
  }

  return protect(req, res, () => authorizeRoles('admin')(req, res, next));
});

router.get('/employers/pending', listPendingEmployers);
router.patch('/employers/:id/approve', approveEmployer);
router.patch('/employers/:id/reject', rejectEmployer);

module.exports = router;
