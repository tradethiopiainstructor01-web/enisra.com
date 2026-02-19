const express = require('express');
const multer = require('multer');
const partnerCompanyController = require('../controllers/partnerCompanyController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', partnerCompanyController.listApprovedPartners);
router.get(
  '/mine',
  protect,
  authorizeRoles('employer', 'admin'),
  partnerCompanyController.listMyPartners
);
router.get('/pending', protect, authorizeRoles('admin'), partnerCompanyController.listPendingPartners);
router.post('/', protect, authorizeRoles('admin', 'employer'), partnerCompanyController.createPartner);
router.post(
  '/upload-logo',
  protect,
  authorizeRoles('admin', 'employer'),
  upload.single('file'),
  partnerCompanyController.uploadPartnerLogo
);
router.patch('/:id/approve', protect, authorizeRoles('admin'), partnerCompanyController.approvePartner);
router.delete('/:id', protect, authorizeRoles('admin'), partnerCompanyController.removePartner);

module.exports = router;
