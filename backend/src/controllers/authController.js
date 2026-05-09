const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { sendEmailOTP, sendSMSOTP } = require('../utils/sendOTP');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. Send Email OTP
const sendEmailOTPHandler = async (req, res) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate(
      { email },
      { email, emailOtp: otp, isEmailVerified: false, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    await sendEmailOTP(email, otp);
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Verify Email OTP
const verifyEmailOTPHandler = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OTP.findOne({ email, emailOtp: otp });
    if (!record) return res.status(400).json({ message: 'Invalid Verification Code' });

    if (Date.now() - record.createdAt.getTime() > 30000) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    record.isEmailVerified = true;
    await record.save();
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Send Phone OTP
const sendPhoneOTPHandler = async (req, res) => {
  try {
    const { phone } = req.body;
    const userExists = await User.findOne({ phone });
    if (userExists) return res.status(400).json({ message: 'Phone number already registered' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate(
      { phone },
      { phone, phoneOtp: otp, isPhoneVerified: false },
      { upsert: true, new: true }
    );

    await sendSMSOTP(phone, otp);
    res.status(200).json({ message: 'OTP sent to mobile' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Verify Phone OTP
const verifyPhoneOTPHandler = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const record = await OTP.findOne({ phone, phoneOtp: otp });
    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });

    record.isPhoneVerified = true;
    await record.save();
    res.status(200).json({ message: 'Phone verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Final Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord || !otpRecord.isEmailVerified) {
      return res.status(400).json({ message: 'Please verify your email address first' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      phone: '', // Optional, left blank for now
      password: hashedPassword,
      isEmailVerified: true,
      isPhoneVerified: false,
      authProvider: 'local'
    });

    await OTP.deleteOne({ _id: otpRecord._id });
    res.status(201).json({ 
      _id: newUser._id, 
      name: newUser.name, 
      email: newUser.email, 
      role: newUser.role, 
      message: 'Registration successful! Please sign in.' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ field: 'email', message: 'Email not found' });
    if (user.authProvider === 'google') return res.status(400).json({ field: 'email', message: 'Please sign in with Google' });

    if (await bcrypt.compare(password, user.password)) {
      res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, doctorId: user.doctorId, token: generateToken(user._id) });
    } else {
      res.status(401).json({ field: 'password', message: 'Wrong password, try again' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        phone: 'GoogleAuth_' + Date.now(),
        password: crypto.randomBytes(16).toString('hex'),
        isEmailVerified: true,
        authProvider: 'google'
      });
    }
    res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, doctorId: user.doctorId, token: generateToken(user._id) });
  } catch (error) {
    res.status(400).json({ message: 'Invalid Google token' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    
    if (req.body.heartRate !== undefined) user.heartRate = req.body.heartRate;
    if (req.body.bloodSugar !== undefined) user.bloodSugar = req.body.bloodSugar;
    if (req.body.sleepScore !== undefined) user.sleepScore = req.body.sleepScore;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      heartRate: updatedUser.heartRate,
      bloodSugar: updatedUser.bloodSugar,
      sleepScore: updatedUser.sleepScore,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

const forgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ field: 'email', message: 'Email not found' });
    if (user.authProvider === 'google') return res.status(400).json({ field: 'email', message: 'This account uses Google Sign In' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate(
      { email },
      { email, emailOtp: otp, isEmailVerified: false, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    await sendEmailOTP(email, otp);
    res.status(200).json({ message: 'Password reset OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Check if OTP matches
    const record = await OTP.findOne({ email, emailOtp: otp });
    if (!record) {
      return res.status(400).json({ field: 'otp', message: 'Invalid OTP' });
    }

    if (!record.isEmailVerified) {
      return res.status(400).json({ field: 'otp', message: 'OTP not verified' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await OTP.deleteOne({ _id: record._id });

    res.status(200).json({ message: 'Password reset successful!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendEmailOTP: sendEmailOTPHandler,
  verifyEmailOTP: verifyEmailOTPHandler,
  sendPhoneOTP: sendPhoneOTPHandler,
  verifyPhoneOTP: verifyPhoneOTPHandler,
  registerUser,
  loginUser,
  googleAuth,
  updateProfile,
  forgotPasswordOTP,
  resetPassword
};
