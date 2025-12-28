const Favorite = require('../models/Favorite');

// @desc    Get all user favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
    try {
        const favorites = await Favorite.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: favorites.length,
            data: favorites
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle favorite status (Add/Remove)
// @route   POST /api/favorites/toggle
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
    try {
        const { recipeId, recipeName, recipeImage } = req.body;

        if (!recipeId) {
            return res.status(400).json({ success: false, message: 'Recipe ID is required' });
        }

        const existing = await Favorite.findOne({ user: req.user.id, recipeId });

        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            return res.status(200).json({
                success: true,
                isFavorite: false,
                message: 'Removed from favorites'
            });
        } else {
            const newFavorite = await Favorite.create({
                user: req.user.id,
                recipeId,
                recipeName,
                recipeImage
            });
            return res.status(201).json({
                success: true,
                isFavorite: true,
                data: newFavorite,
                message: 'Added to favorites'
            });
        }
    } catch (error) {
        next(error);
    }
};
