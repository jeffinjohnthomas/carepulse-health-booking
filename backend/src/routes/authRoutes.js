const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
  sendEmailOTP,
  verifyEmailOTP,
  sendPhoneOTP,
  verifyPhoneOTP,
  registerUser, 
  loginUser, 
  googleAuth,
  updateProfile,
  forgotPasswordOTP,
  resetPassword
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many requests, please try again later'
});

router.use(authLimiter);

router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/send-phone-otp', sendPhoneOTP);
router.post('/verify-phone-otp', verifyPhoneOTP);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/forgot-password-otp', forgotPasswordOTP);
router.post('/reset-password', resetPassword);

router.put('/profile', protect, updateProfile);

module.exports = router;
