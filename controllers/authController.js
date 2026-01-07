const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT with ID and Role
const generateToken = (id, role) => {
    return jwt.sign(
        { id: id, role: role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email }).select('_id');

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user'
        });

        if (user) {
            res.status(201).json({
                success: true,
                token: generateToken(user._id, user.role),
                userId: user._id,
                name: user.name,
                role: user.role
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate a user & get token (Optimized for Mobile)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // 1. Fetch minimal fields needed for auth (Indexed email)
        const user = await User.findOne({ email }).select('+password name role');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // 2. Fast credential check
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // 3. Return ONLY essential auth data (Fast response)
        res.json({
            success: true,
            token: generateToken(user._id, user.role),
            userId: user._id,
            name: user.name,
            role: user.role
        });
    } catch (error) {
        next(error);
    }
};

