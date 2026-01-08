const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        // OPTIMIZATION: Use .lean() for faster read-only execution
        const user = await User.findById(userId)
            .select('-password')
            .lean();

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
