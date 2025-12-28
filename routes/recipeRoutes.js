const express = require('express');
const router = express.Router();
const { generateRecipes, toggleFavorite, getFavorites } = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/generate', generateRecipes);

module.exports = router;
