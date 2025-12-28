const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Generate JWT with ID and Role
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    console.log('📝 Register Request received:', req.body);
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('⚠️ User already exists:', email);
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        console.log('🔨 Creating user in database...');
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user'
        });

        if (user) {
            console.log('✅ User created successfully:', user._id);
            res.status(201).json({
                success: true,
                token: generateToken(user),
                userId: user._id,
                name: user.name,
                role: user.role
            });
        }
    } catch (error) {
        console.error('❌ Registration Error:', error.message);
        next(error); // Pass to errorMiddleware
    }
};

// @desc    Authenticate a user & get token (Using Passport Local)
// @route   POST /api/auth/login
// @access  Public
exports.login = (req, res, next) => {
    console.log('🔑 Login attempt:', req.body.email);
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            console.error('❌ Passport Auth Error:', err);
            return next(err);
        }

        if (!user) {
            console.log('⚠️ Login failed:', info ? info.message : 'No user found');
            return res.status(401).json({
                success: false,
                message: info ? info.message : 'Invalid credentials'
            });
        }

        // Generate Token
        const token = generateToken(user);

        console.log('✅ Login successful:', user.email);
        res.json({
            success: true,
            token,
            userId: user._id,
            name: user.name,
            role: user.role
        });
    })(req, res, next);
};
