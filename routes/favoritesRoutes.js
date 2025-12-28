const express = require('express');
const router = express.Router();
const { getFavorites, toggleFavorite } = require('../controllers/favoritesController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getFavorites);

router.route('/toggle')
    .post(toggleFavorite);

module.exports = router;
