const axios = require('axios');
const Item = require('../models/Item');
const Favorite = require('../models/Favorite');

// @desc    Generate smart recipes based on inventory
// @route   GET /api/recipes/generate
// @access  Private
exports.generateRecipes = async (req, res, next) => {
    try {
        // 1. Get user items (not expired)
        const now = new Date();
        const items = await Item.find({
            user: req.user.id,
            expiryDate: { $gt: now }
        }).sort({ expiryDate: 1 });

        if (items.length === 0) {
            return res.json({
                success: true,
                message: "Add some items to your inventory to see magic recipes!",
                recipes: []
            });
        }

        const ingredientNames = items.map(i => i.name.toLowerCase());

        // 2. Fetch recipes from TheMealDB
        // Since the free API only allows filtering by ONE ingredient, 
        // we'll fetch for the top 3 expiring ingredients and merge.
        const topIngredients = items.slice(0, 3).map(i => i.name.toLowerCase());

        let allRecipePreviews = [];
        for (const ing of topIngredients) {
            try {
                const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ing)}`);
                if (response.data.meals) {
                    allRecipePreviews = [...allRecipePreviews, ...response.data.meals];
                }
            } catch (err) {
                console.error(`Error fetching for ingredient ${ing}:`, err.message);
            }
        }

        // 3. Deduplicate
        const uniqueRecipes = Array.from(new Set(allRecipePreviews.map(m => m.idMeal)))
            .map(id => allRecipePreviews.find(m => m.idMeal === id))
            .slice(0, 10); // Limit to 10 for detailed matching

        // 4. Detailed Match & Rank
        const finalRecipes = [];
        for (const mealPreview of uniqueRecipes) {
            try {
                const detailRes = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealPreview.idMeal}`);
                const meal = detailRes.data.meals[0];

                // Extract ingredients
                const mealIngredients = [];
                for (let i = 1; i <= 20; i++) {
                    const ing = meal[`strIngredient${i}`];
                    if (ing && ing.trim()) {
                        mealIngredients.push(ing.toLowerCase());
                    }
                }

                // Match count
                const matchingIngredients = mealIngredients.filter(mi =>
                    ingredientNames.some(ui => mi.includes(ui) || ui.includes(mi))
                );

                finalRecipes.push({
                    id: meal.idMeal,
                    name: meal.strMeal,
                    image: meal.strMealThumb,
                    instructions: meal.strInstructions,
                    category: meal.strCategory,
                    area: meal.strArea,
                    ingredients: mealIngredients,
                    measures: Array.from({ length: 20 }, (_, i) => meal[`strMeasure${i + 1}`]).filter(Boolean),
                    matchingCount: matchingIngredients.length,
                    totalCount: mealIngredients.length,
                    usedIngredients: matchingIngredients
                });
            } catch (err) {
                console.error(`Error fetching details for ${mealPreview.idMeal}:`, err.message);
            }
        }

        // 5. Rank: highest match first
        finalRecipes.sort((a, b) => b.matchingCount - a.matchingCount);

        res.json({
            success: true,
            recipes: finalRecipes.slice(0, 8)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle favorite status
// @route   POST /api/recipes/favorite
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
    try {
        const { id, name, image } = req.body;

        const existing = await Favorite.findOne({ user: req.user.id, recipeId: id });

        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            return res.json({ success: true, isFavorite: false });
        } else {
            const newFavorite = new Favorite({
                user: req.user.id,
                recipeId: id,
                recipeName: name,
                recipeImage: image
            });
            await newFavorite.save();
            return res.json({ success: true, isFavorite: true });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get favorites
// @route   GET /api/recipes/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
    try {
        const favorites = await Favorite.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(favorites);
    } catch (error) {
        next(error);
    }
};
