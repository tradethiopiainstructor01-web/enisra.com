const express = require('express');
const partnerCompanyController = require('../controllers/partnerCompanyController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

const router = express.Router();

router.get('/', partnerCompanyController.listApprovedPartners);
router.get(
  '/mine',
  protect,
  authorizeRoles('employer', 'admin'),
  partnerCompanyController.listMyPartners
);
router.get('/pending', protect, authorizeRoles('admin'), partnerCompanyController.listPendingPartners);
router.post('/', protect, authorizeRoles('admin', 'employer'), partnerCompanyController.createPartner);
router.patch('/:id/approve', protect, authorizeRoles('admin'), partnerCompanyController.approvePartner);
router.delete('/:id', protect, authorizeRoles('admin'), partnerCompanyController.removePartner);

module.exports = router;
