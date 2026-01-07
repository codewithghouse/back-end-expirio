const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const passport = require('passport');

router.get('/stats', passport.authenticate('jwt', { session: false }), getStats);

module.exports = router;
