const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
    console.log("📡 [Controller] getReviews called");
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        console.log(`✅ [Controller] Found ${reviews.length} reviews`);
        res.status(200).json(reviews);
    } catch (error) {
        console.error("❌ [Controller] getReviews Error:", error);
        next(error);
    }
};

// @desc    Get current user's review
// @route   GET /api/reviews/me
// @access  Private
exports.getMyReview = async (req, res, next) => {
    const userId = req.user._id || req.user.id;
    console.log(`📡 [Controller] getMyReview called for user: ${userId}`);
    try {
        const review = await Review.findOne({ user: userId });
        console.log(`✅ [Controller] getMyReview status: ${review ? 'Found' : 'Not Found'}`);
        res.status(200).json(review);
    } catch (error) {
        console.error("❌ [Controller] getMyReview Error:", error);
        next(error);
    }
};

// @desc    Create or update review
// @route   POST /api/reviews
// @access  Private
exports.createOrUpdateReview = async (req, res, next) => {
    try {
        const { rating, reviewText } = req.body;

        if (!rating || !reviewText) {
            return res.status(400).json({ success: false, message: 'Please provide rating and review text' });
        }

        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let review = await Review.findOne({ user: userId });

        if (review) {
            // Update
            review.rating = rating;
            review.reviewText = reviewText;
            review.name = user.name; // Keep name synced
            await review.save();
            return res.json(review);
        }

        // Create
        review = new Review({
            user: userId,
            name: user.name,
            rating,
            reviewText
        });

        await review.save();
        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
};
