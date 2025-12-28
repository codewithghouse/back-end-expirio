const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipeId: {
        type: String,
        required: true
    },
    recipeName: {
        type: String,
        required: true
    },
    recipeImage: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Avoid duplicate favorites for same user and recipe
favoriteSchema.index({ user: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
