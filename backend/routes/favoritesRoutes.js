const express = require('express');
const { protect } = require('../middleware/auth');
const { addFavorite, removeFavorite, getFavorites, checkFavorite } = require('../controllers/favoritesController');

const router = express.Router();

router.post('/:jobId', protect, addFavorite);
router.delete('/:jobId', protect, removeFavorite);
router.get('/', protect, getFavorites);
router.get('/:jobId/check', protect, checkFavorite);

module.exports = router;