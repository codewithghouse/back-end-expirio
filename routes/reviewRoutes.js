const express = require('express');
const router = express.Router();
const { getReviews, getMyReview, createOrUpdateReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

console.log("🔥 [Review Routes] Initializing...");
router.get('/', (req, res, next) => {
    console.log("🔥 [GET /api/reviews] Hit");
    getReviews(req, res, next);
});
router.get('/me', protect, (req, res, next) => {
    console.log("🔥 [GET /api/reviews/me] Hit");
    getMyReview(req, res, next);
});
router.post('/', protect, (req, res, next) => {
    console.log("🔥 [POST /api/reviews] Hit");
    createOrUpdateReview(req, res, next);
});

module.exports = router;
