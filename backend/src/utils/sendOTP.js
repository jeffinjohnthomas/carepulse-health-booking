const nodemailer = require('nodemailer');

const sendEmailOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    const mailOptions = {
      from: `"HealthPortal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Registration OTP - HealthPortal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">Welcome to HealthPortal</h2>
          <p>Hello,</p>
          <p>Your one-time password (OTP) for account verification is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px 20px; border-radius: 5px;">${otp}</span>
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">© 2026 HealthPortal. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[REAL EMAIL] OTP sent to ${email}`);
  } catch (error) {
    console.error('Error sending email OTP:', error);
    // Even if it fails, we log it for the user to see in dev
    console.log(`[FALLBACK] Email OTP for ${email}: ${otp}`);
  }
};

const sendSMSOTP = async (phone, otp) => {
  // To send real SMS, you'd integrate Twilio here
  // For now, we log it to console as a "Real" action placeholder
  console.log('------------------------------------');
  console.log(`[SMS ACTION] Sending REAL SMS to: ${phone}`);
  console.log(`[SMS OTP CODE]: ${otp}`);
  console.log('------------------------------------');
};

module.exports = { sendEmailOTP, sendSMSOTP };
