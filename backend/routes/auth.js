const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Logout user
router.post('/logout', auth, authController.logout);

// Get current user
router.get('/me', auth, (req, res) => {
    res.send(req.user);
});

module.exports = router;