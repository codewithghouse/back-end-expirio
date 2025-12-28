const express = require('express');
const router = express.Router();
const { getMe, getUsers } = require('../controllers/userController');
const { protect, allowUser, allowAdmin } = require('../middleware/authMiddleware');

// Get current user profile (Both user and admin can access)
router.get('/me', protect, allowUser, getMe);

// Get all users (Only admin can access)
router.get('/', protect, allowAdmin, getUsers);

module.exports = router;
