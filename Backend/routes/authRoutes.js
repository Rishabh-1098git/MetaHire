const express = require('express');
const { registerUser, loginUser, getUserProfile, updateProfile, forgetPassword, resetPassword,test } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Routes
router.post('/signup', registerUser);
router.post('/signin', loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/forget-password', forgetPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/test', test)
module.exports = router;
