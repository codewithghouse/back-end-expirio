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

// @desc    Authenticate a user & get token (Optimized with Auto-Signup)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    const { email, password, name } = req.body;
    console.log(`📡 [LOGIN] Attempt for email: ${email}`);

    try {
        // 1. Fetch user (with password for verification)
        let user = await User.findOne({ email }).select('+password name role');

        if (!user) {
            console.log(`🔍 [LOGIN] User not found for ${email}. Creating new record (Auto-Signup)...`);
            // Create user if doesn't exist (Safe for testing/dummy flows)
            user = await User.create({
                name: name || email.split('@')[0], // Fallback to email prefix
                email,
                password,
                role: 'user'
            });
            console.log(`✅ [LOGIN] New user created successfully: ${user._id}`);
        } else {
            // 2. Fast credential check for existing user
            console.log(`🔑 [LOGIN] User exists. Validating credentials...`);
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                console.warn(`⚠️ [LOGIN] Password mismatch for ${email}`);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
            console.log(`✅ [LOGIN] Password verified for ${user.email}`);
        }

        // 3. Return ONLY essential auth data (Fast response)
        const token = generateToken(user._id, user.role);
        console.log(`🎫 [LOGIN] Token generated for userId: ${user._id}`);

        res.json({
            success: true,
            token,
            userId: user._id,
            name: user.name,
            role: user.role
        });
    } catch (error) {
        console.error(`❌ [LOGIN ERROR] ${error.message}`);
        next(error);
    }
};


