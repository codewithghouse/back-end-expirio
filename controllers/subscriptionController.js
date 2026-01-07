const User = require('../models/User');

// @desc    Update user subscription (Dummy Payment)
// @route   POST /api/subscription/update
// @access  Private
// @desc    Update user subscription (Dummy Payment)
// @route   POST /api/subscription/update
// @access  Private
exports.updateSubscription = async (req, res, next) => {
    const { plan, paymentId } = req.body;
    const userId = req.user._id || req.user.id;

    console.log(`💳 [PAYMENT SUCCESS] Callback received for userId: ${userId}, plan: ${plan}`);

    try {
        // 1. Fetch existing user (Requirement: NEVER create user here)
        const user = await User.findById(userId);

        if (!user) {
            console.error(`❌ [PAYMENT ERROR] User not found during subscription update. ID: ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'Internal Error: Authenticated user not found in database. Please re-login.'
            });
        }

        console.log(`👤 [PAYMENT] User found: ${user.email}. Updating subscription...`);

        // 2. Setup subscription dates
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
                expiryDate = new Date('2099-12-31');
                break;
            default:
                console.warn(`⚠️ [PAYMENT] Invalid plan received: ${plan}`);
                return res.status(400).json({ success: false, message: 'Invalid plan' });
        }

        // 3. Update subscription fields ONLY
        user.subscription = {
            plan,
            startDate,
            expiryDate,
            status: 'active'
        };

        await user.save();
        console.log(`✅ [PAYMENT SUCCESS] Subscription activated for ${user.email} until ${expiryDate.toDateString()}`);

        res.status(200).json({
            success: true,
            message: 'Subscription updated successfully',
            subscription: user.subscription
        });
    } catch (error) {
        console.error(`❌ [SUBSCRIPTION UPDATE ERROR] ${error.message}`);
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
