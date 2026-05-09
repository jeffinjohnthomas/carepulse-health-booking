const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email: String,
  phone: String,
  emailOtp: String,
  phoneOtp: String,
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Increased to 10 minutes to allow time for both
  },
});

module.exports = mongoose.model('OTP', OTPSchema);
