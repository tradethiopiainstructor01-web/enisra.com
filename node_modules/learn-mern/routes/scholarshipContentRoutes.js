const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const {
  listPublishedScholarshipContent,
  listScholarshipContentForAdmin,
  createScholarshipContent,
  updateScholarshipContent,
  deleteScholarshipContent,
  uploadScholarshipResource,
} = require('../controllers/scholarshipContentController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.get('/', listPublishedScholarshipContent);
router.get('/admin', protect, authorizeRoles('admin'), listScholarshipContentForAdmin);
router.post('/', protect, authorizeRoles('admin'), createScholarshipContent);
router.post(
  '/upload-resource',
  protect,
  authorizeRoles('admin'),
  upload.single('file'),
  uploadScholarshipResource
);
router.put('/:id', protect, authorizeRoles('admin'), updateScholarshipContent);
router.patch('/:id', protect, authorizeRoles('admin'), updateScholarshipContent);
router.post('/:id', protect, authorizeRoles('admin'), updateScholarshipContent);
router.delete('/:id', protect, authorizeRoles('admin'), deleteScholarshipContent);

module.exports = router;
