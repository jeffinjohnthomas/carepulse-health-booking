import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, HeartPulse, Phone, CheckCircle, XCircle, Eye, EyeOff, Send } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  sendEmailOTP, 
  verifyEmailOTP, 
  sendPhoneOTP, 
  verifyPhoneOTP, 
  registerUser, 
  googleAuth, 
  resetAuthStatus,
  resetVerification
} from '../../features/authSlice';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otps, setOtps] = useState({ email: '' });
  const [otpSent, setOtpSent] = useState({ email: false });
  const [passwordCriteria, setPasswordCriteria] = useState({ length: false, upper: false, lower: false, number: false, special: false, match: false });
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isError, isSuccess, message, isLoading, emailVerified } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear verification state on fresh page load
    dispatch(resetVerification());
  }, [dispatch]);

  useEffect(() => {
    // Only show generic alert if it's a global error, we handle field-specific locally
    if (isError && typeof message === 'string' && !message.includes('already registered')) { 
      dispatch(resetAuthStatus()); 
    }
    if (isSuccess && message?.includes('Registration successful')) {
      dispatch(resetVerification());
      navigate('/login');
      dispatch(resetAuthStatus());
    }
    if (isAuthenticated) navigate('/');
  }, [isError, isSuccess, isAuthenticated, message, navigate, dispatch]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validatePassword = (pass, confirmPass) => {
    setPasswordCriteria({
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[@$!%*?&]/.test(pass),
      match: pass === confirmPass && pass.length > 0
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'password' || name === 'confirmPassword') validatePassword(name === 'password' ? value : newData.password, name === 'confirmPassword' ? value : newData.confirmPassword);
      return newData;
    });
  };

  const [successMsg, setSuccessMsg] = useState({ email: '' });

  const handleSendOTP = () => {
    setErrors({});
    setSuccessMsg({ email: '' });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) return setErrors({ email: "Enter email first" });
    if (!emailRegex.test(formData.email)) return setErrors({ email: "Please enter a valid email address" });
    
    dispatch(sendEmailOTP(formData.email))
      .unwrap()
      .then(() => {
        setOtpSent(p => ({ ...p, email: true }));
        setSuccessMsg(p => ({ ...p, email: 'Sent code. Please check your email inbox!' }));
        setTimer(30);
      })
      .catch(err => setErrors({ email: err.message || err }));
  };

  const handleVerifyOTP = () => {
    setErrors({});
    dispatch(verifyEmailOTP({ email: formData.email, otp: otps.email }))
      .unwrap()
      .catch(err => setErrors({ email: err.message || err || 'Invalid Verification Code' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (emailVerified && Object.values(passwordCriteria).every(Boolean)) {
      dispatch(registerUser(formData));
    }
  };

  const handleGoogleSuccess = (credentialResponse) => dispatch(googleAuth(credentialResponse.credential));

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 py-12">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-200/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl p-8 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-[0_4px_12px_rgb(37,99,235,0.3)] mb-4">
              <HeartPulse size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
            <p className="text-slate-500 mt-2">Verify your email to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><UserIcon size={20} /></div>
              <input type="text" name="name" placeholder="Full Name" className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" value={formData.name} onChange={handleChange} required />
            </div>

            {/* Email + OTP */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Mail size={20} /></div>
                  <input type="email" name="email" placeholder="Email address" disabled={emailVerified} className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-100" value={formData.email} onChange={handleChange} required />
                </div>
                {!emailVerified && (
                  <button type="button" onClick={() => handleSendOTP()} disabled={isLoading} className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center space-x-1 whitespace-nowrap">
                    <Send size={16} /> <span className="hidden sm:inline">Verification Code</span><span className="sm:hidden">Code</span>
                  </button>
                )}
                {emailVerified && <div className="px-4 py-3 bg-green-100 text-green-600 rounded-xl flex items-center"><CheckCircle size={20} /></div>}
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
              {successMsg.email && <p className="text-green-500 text-xs mt-1 ml-1">{successMsg.email}</p>}
              {otpSent.email && !emailVerified && (
                <div className="animate-in fade-in slide-in-from-top-2 mt-2">
                  <div className="flex space-x-2">
                    <input type="text" placeholder="Enter Verification Code" className="flex-grow px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" value={otps.email} onChange={(e) => setOtps(p => ({ ...p, email: e.target.value }))} />
                    <button type="button" onClick={() => handleVerifyOTP()} className="px-4 py-2 bg-teal-600 text-white rounded-xl flex items-center space-x-1 font-medium hover:bg-teal-700 transition-colors">
                      <span>Verify</span>
                      <CheckCircle size={18} />
                    </button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <button type="button" onClick={() => handleSendOTP()} disabled={isLoading || timer > 0} className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:text-slate-500">
                      {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Removed Phone + OTP Section */}

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Lock size={20} /></div>
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" className="w-full pl-11 pr-12 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" value={formData.password} onChange={handleChange} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 text-slate-400 hover:text-teal-600">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Lock size={20} /></div>
              <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" value={formData.confirmPassword} onChange={handleChange} required />
            </div>

            {/* Criteria */}
            <div className="bg-slate-50 p-4 rounded-xl text-xs border border-slate-200 space-y-2">
              <ul className="grid grid-cols-3 gap-2">
                <li className="flex items-center space-x-1">{passwordCriteria.length ? <CheckCircle size={14} className="text-green-500"/> : <XCircle size={14} className="text-slate-300"/>} <span>8+ chars</span></li>
                <li className="flex items-center space-x-1">{passwordCriteria.upper ? <CheckCircle size={14} className="text-green-500"/> : <XCircle size={14} className="text-slate-300"/>} <span>Upper</span></li>
                <li className="flex items-center space-x-1">{passwordCriteria.lower ? <CheckCircle size={14} className="text-green-500"/> : <XCircle size={14} className="text-slate-300"/>} <span>Lower</span></li>
                <li className="flex items-center space-x-1">{passwordCriteria.number ? <CheckCircle size={14} className="text-green-500"/> : <XCircle size={14} className="text-slate-300"/>} <span>Number</span></li>
                <li className="flex items-center space-x-1">{passwordCriteria.special ? <CheckCircle size={14} className="text-green-500"/> : <XCircle size={14} className="text-slate-300"/>} <span>Special</span></li>
                <li className="flex items-center space-x-1">{passwordCriteria.match ? <CheckCircle size={14} className="text-green-500"/> : <XCircle size={14} className="text-slate-300"/>} <span>Match</span></li>
              </ul>
            </div>

            {/* Main Register Button */}
            <button
              type="submit"
              disabled={!emailVerified || !Object.values(passwordCriteria).every(Boolean) || isLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Processing...' : 'Create Account'}</span>
              <CheckCircle size={20} />
            </button>

            <div className="relative flex items-center py-2"><div className="flex-grow border-t border-slate-200"></div><span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or</span><div className="flex-grow border-t border-slate-200"></div></div>
            <div className="flex justify-center"><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert('Google Sign In Failed')} /></div>
          </form>

          <p className="text-center text-slate-600 mt-8 text-sm">Already have an account? <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">Sign in instead</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
