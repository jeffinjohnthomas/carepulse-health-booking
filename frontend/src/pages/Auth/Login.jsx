import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, HeartPulse, ArrowRight, Eye, EyeOff, Send, CheckCircle, XCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, googleAuth, resetAuthStatus } from '../../features/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import api from '../../services/api';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotData, setForgotData] = useState({ email: '', otp: '', newPassword: '' });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotTimer, setForgotTimer] = useState(0);
  const [forgotMessage, setForgotMessage] = useState('');
  const [passwordCriteria, setPasswordCriteria] = useState({ length: false, upper: false, lower: false, number: false, special: false });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isError, message, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only alert if it's a generic global error not caught by local field handlers
    if (isError && typeof message === 'string' && message !== '') {
      if (!message.includes('Wrong password') && !message.includes('Email not found')) {
        alert(message);
      }
      dispatch(resetAuthStatus());
    }
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isError, isAuthenticated, message, navigate, dispatch]);

  useEffect(() => {
    let interval;
    if (forgotTimer > 0) {
      interval = setInterval(() => {
        setForgotTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [forgotTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error when typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validatePassword = (pass) => {
    setPasswordCriteria({
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[@$!%*?&#]/.test(pass)
    });
  };

  const handleForgotChange = (e) => {
    setForgotData({ ...forgotData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    if (e.target.name === 'newPassword') {
      validatePassword(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await dispatch(loginUser(formData)).unwrap();
    } catch (err) {
      if (err?.field) {
        setErrors({ [err.field]: err.message });
      } else {
        setErrors({ global: err?.message || String(err) });
      }
    }
  };

  const handleForgotOTP = async (e) => {
    e.preventDefault();
    setErrors({});
    setForgotMessage('');
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password-otp', { email: forgotData.email });
      setForgotMessage(res.data.message);
      setForgotStep(2);
      setForgotTimer(30);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.field) {
        setErrors({ [errorData.field]: errorData.message });
      } else {
        alert(errorData?.message || 'Failed to send OTP');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerifyOTP = async (e) => {
    e.preventDefault();
    setErrors({});
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/verify-email-otp', { email: forgotData.email, otp: forgotData.otp });
      setForgotMessage(res.data.message);
      setForgotStep(3);
    } catch (err) {
      const errorData = err.response?.data;
      setErrors({ otp: errorData?.message || 'Invalid OTP' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/reset-password', forgotData);
      setForgotMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep(1);
        setForgotData({ email: '', otp: '', newPassword: '' });
        setFormData({ email: forgotData.email, password: '' });
        setForgotMessage('');
        setPasswordCriteria({ length: false, upper: false, lower: false, number: false, special: false });
      }, 2000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.field) {
        setErrors({ [errorData.field]: errorData.message });
      } else {
        alert(errorData?.message || 'Failed to reset password');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleAuth(credentialResponse.credential));
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 py-12">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-200/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-[0_4px_12px_rgb(37,99,235,0.3)] mb-4">
              <HeartPulse size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              {showForgot ? 'Reset Password' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 mt-2">
              {showForgot ? 'Follow the steps to recover your account' : 'Enter your credentials to access your portal'}
            </p>
          </div>

          {!showForgot ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.global && <p className="text-red-500 bg-red-50 p-3 rounded-xl text-sm text-center">{errors.global}</p>}
              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      className={`w-full pl-11 pr-4 py-3 bg-white/50 border rounded-xl focus:ring-2 outline-none transition-all placeholder:text-slate-400 text-slate-700 ${errors.email ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'}`}
                      onChange={handleChange}
                      value={formData.email}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      className={`w-full pl-11 pr-12 py-3 bg-white/50 border rounded-xl focus:ring-2 outline-none transition-all placeholder:text-slate-400 text-slate-700 ${errors.password ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'}`}
                      onChange={handleChange}
                      value={formData.password}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-slate-600">Remember me</span>
                </label>
                <button type="button" onClick={() => setShowForgot(true)} className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold shadow-md shadow-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight size={18} />
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              
              <div className="flex justify-center">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert('Google Sign In Failed')} />
              </div>

              <p className="text-center text-slate-600 mt-8 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Create one now
                </Link>
              </p>
            </form>
          ) : (
            <div className="space-y-6">
              {forgotMessage && <p className="text-green-600 bg-green-50 p-3 rounded-xl text-sm text-center">{forgotMessage}</p>}
              
              {forgotStep === 1 && (
                <form onSubmit={handleForgotOTP} className="space-y-4">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail size={20} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Registered Email address"
                        className={`w-full pl-11 pr-4 py-3 bg-white/50 border rounded-xl focus:ring-2 outline-none transition-all placeholder:text-slate-400 text-slate-700 ${errors.email ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'}`}
                        onChange={handleForgotChange}
                        value={forgotData.email}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{forgotLoading ? 'Sending...' : 'Send Recovery OTP'}</span>
                    <Send size={18} />
                  </button>
                </form>
              )}
              {forgotStep === 2 && (
                <form onSubmit={handleForgotVerifyOTP} className="space-y-4">
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:ring-2 outline-none transition-all placeholder:text-slate-400 text-slate-700 ${errors.otp ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'}`}
                        onChange={handleForgotChange}
                        value={forgotData.otp}
                        required
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      {errors.otp ? <p className="text-red-500 text-xs ml-1">{errors.otp}</p> : <div/>}
                      <button type="button" onClick={handleForgotOTP} disabled={forgotLoading || forgotTimer > 0} className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:text-slate-500">
                        {forgotTimer > 0 ? `Resend Code in ${forgotTimer}s` : 'Resend Code'}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>Verify</span>
                    <CheckCircle size={18} />
                  </button>
                </form>
              )}
              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock size={20} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="New Password"
                        className="w-full pl-11 pr-12 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                        onChange={handleForgotChange}
                        value={forgotData.newPassword}
                        required
                        minLength={8}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl text-xs border border-slate-200 space-y-2">
                    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <li className="flex items-center space-x-1">{passwordCriteria.length ? <CheckCircle size={14} className="text-green-500"/> : <XCircle size={14} className="text-slate-300"/>} <span>8+ chars</span></li>
                      <li className="flex items-center space-x-1">{passwordCriteria.upper ? <CheckCircle size={14} className="text-green-500"/> : <XCircle size={14} className="text-slate-300"/>} <span>Upper</span></li>
                      <li className="flex items-center space-x-1">{passwordCriteria.lower ? <CheckCircle size={14} className="text-green-500"/> : <XCircle size={14} className="text-slate-300"/>} <span>Lower</span></li>
                      <li className="flex items-center space-x-1">{passwordCriteria.number ? <CheckCircle size={14} className="text-green-500"/> : <XCircle size={14} className="text-slate-300"/>} <span>Number</span></li>
                      <li className="flex items-center space-x-1">{passwordCriteria.special ? <CheckCircle size={14} className="text-green-500"/> : <XCircle size={14} className="text-slate-300"/>} <span>Special</span></li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading || !Object.values(passwordCriteria).every(Boolean)}
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{forgotLoading ? 'Updating...' : 'Reset Password'}</span>
                    <CheckCircle size={18} />
                  </button>
                </form>
              )}

              <button type="button" onClick={() => { setShowForgot(false); setForgotStep(1); setErrors({}); }} className="w-full text-center text-slate-500 hover:text-slate-700 text-sm font-medium mt-4">
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
