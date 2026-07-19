const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  forgetPassword,
  resetPassword,
  googleAuth,
  verifyEmailOtp,
  resendOtp,
  test
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Routes
router.post('/signup', registerUser);
router.post('/signin', loginUser);
router.post('/google', googleAuth);
router.post('/verify-otp', verifyEmailOtp);
router.post('/resend-otp', resendOtp);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/forget-password', forgetPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/test', test)
module.exports = router;
