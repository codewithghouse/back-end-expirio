const passport = require('passport');

// Standard protection (any logged-in user can access)
const protect = passport.authenticate('jwt', { session: false });

// Allow both "user" and "admin" (redundant with protect but clarifies intent)
const allowUser = (req, res, next) => {
    if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Unauthorized role' });
    }
};

// Allow only "admin"
const allowAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admins only' });
    }
};

module.exports = { protect, allowUser, allowAdmin };
