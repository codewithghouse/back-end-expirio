const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// User Registration Validation
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
];

// User Login Validation
const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

// Item Validation
const itemValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Item name is required'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['dairy', 'produce', 'meat', 'pantry', 'frozen', 'beverages', 'other'])
        .withMessage('Invalid category'),
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isNumeric().withMessage('Quantity must be a number')
        .custom(value => value > 0).withMessage('Quantity must be greater than 0'),
    body('unit')
        .trim()
        .notEmpty().withMessage('Unit is required'),
    body('expiryDate')
        .notEmpty().withMessage('Expiry date is required')
        .isISO8601().withMessage('Invalid date format')
        .toDate(),
    body('location')
        .notEmpty().withMessage('Location is required')
        .isIn(['fridge', 'freezer', 'pantry'])
        .withMessage('Invalid location'),
    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    itemValidation
};
