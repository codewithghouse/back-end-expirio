const express = require('express');
const router = express.Router();
const { updateSubscription, getSubscriptionStatus } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/update', protect, updateSubscription);
router.get('/status', protect, getSubscriptionStatus);

module.exports = router;
