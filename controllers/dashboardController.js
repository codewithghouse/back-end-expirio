const Item = require('../models/Item');

// @desc    Get dashboard summary stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res, next) => {
    try {
        const now = new Date();
        const userId = req.user._id;

        // Perform counts in parallel for performance
        const [total, expired, expiringSoon] = await Promise.all([
            Item.countDocuments({ user: userId }),
            Item.countDocuments({ user: userId, expiryDate: { $lt: now } }),
            Item.countDocuments({
                user: userId,
                expiryDate: {
                    $gte: now,
                    $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
                }
            })
        ]);

        res.json({
            success: true,
            stats: {
                total,
                expired,
                expiringSoon,
                fresh: total - expired
            }
        });
    } catch (error) {
        next(error);
    }
};
