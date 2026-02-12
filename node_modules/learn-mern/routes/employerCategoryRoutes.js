const express = require('express');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const {
  listEmployerCategories,
  createEmployerCategory,
  updateEmployerCategory,
  deleteEmployerCategory,
} = require('../controllers/employerCategoryController');

const router = express.Router();

router.get('/', listEmployerCategories);
router.post('/', protect, authorizeRoles('admin'), createEmployerCategory);
router.patch('/:id', protect, authorizeRoles('admin'), updateEmployerCategory);
router.delete('/:id', protect, authorizeRoles('admin'), deleteEmployerCategory);

module.exports = router;

