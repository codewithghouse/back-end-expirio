const User = require('../models/User');

// @desc    Update user subscription (Dummy Payment)
// @route   POST /api/subscription/update
// @access  Private
exports.updateSubscription = async (req, res, next) => {
    const { plan } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let expiryDate;
        const startDate = new Date();

        switch (plan) {
            case 'free-trial':
                expiryDate = new Date();
                expiryDate.setDate(startDate.getDate() + 3);
                break;
            case 'weekly':
                expiryDate = new Date();
                expiryDate.setDate(startDate.getDate() + 7);
                break;
            case 'monthly':
                expiryDate = new Date();
                expiryDate.setMonth(startDate.getMonth() + 1);
                break;
            case 'lifetime':
                expiryDate = new Date('2099-12-31'); // Practically lifetime
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid plan' });
        }

        user.subscription = {
            plan,
            startDate,
            expiryDate,
            status: 'active'
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Subscription updated successfully',
            subscription: user.subscription
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user subscription status
// @route   GET /api/subscription/status
// @access  Private
exports.getSubscriptionStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            subscription: user.subscription
        });
    } catch (error) {
        next(error);
    }
};
