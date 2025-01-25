const express = require('express');
const { registerUser, loginUser, getUserProfile, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Routes
router.post('/signup', registerUser);
router.post('/signin', loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateProfile);
module.exports = router;
