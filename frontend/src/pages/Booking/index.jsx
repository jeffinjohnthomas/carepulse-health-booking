import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CreditCard, User, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../services/api';

export default function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    consultationType: 'In-Person',
    visitType: 'First Consultation',
    symptoms: ''
  });

  const doctor = state?.doctor;
  const hospitalId = state?.hospitalId;
  const hospitalName = state?.hospitalName;
  const tokenFee = 50; // Fixed token amount to prevent fake bookings

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/booking', ...state } });
    }
    if (!doctor || !hospitalId || !hospitalName) {
      navigate('/doctors');
    }
  }, [isAuthenticated, navigate, doctor, state, hospitalId, hospitalName]);

  if (!doctor || !hospitalId || !hospitalName) return null;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.date || !formData.timeSlot || !formData.symptoms) {
        setError('Please fill in all details');
        return;
      }
      setError(null);
      setStep(2);
      return;
    }
  };

  const initRazorpay = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Key and Create order
      const [{ data: keyData }, { data: orderData }] = await Promise.all([
        api.get('/payments/get-key'),
        api.post('/payments/create-order', { amount: tokenFee })
      ]);

      if (!orderData || !orderData.success) {
        throw new Error('Failed to create order');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: keyData.key || 'rzp_test_placeholder', // Dynamically injected from backend
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HealthPortal",
        description: `Booking Token for Dr. ${doctor.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setLoading(true);
            // 3. Verify signature and create booking
            await api.post('/bookings', {
              doctorId: doctor._id,
              hospitalId: hospitalId, 
              hospitalName: hospitalName,
              date: formData.date,
              timeSlot: formData.timeSlot,
              consultationType: formData.consultationType,
              visitType: formData.visitType,
              symptoms: formData.symptoms,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            setStep(3); // Success
          } catch (err) {
            console.error('Booking Verification Failed', err);
            setError(err.response?.data?.message || 'Payment verified, but failed to create booking. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: "#2563EB",
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response){
        setError(`Payment failed: ${response.error.description}`);
      });

      rzp.open();

    } catch (err) {
      console.error(err);
      setError('Could not initialize payment gateway. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1E293B] p-8 text-white flex flex-col md:flex-row gap-6 items-center">
            <img src={doctor.imageUrl || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop"} alt={doctor.name} className="w-24 h-24 rounded-full object-cover border-4 border-slate-700" />
            <div>
              <h2 className="text-2xl font-bold">{doctor.name}</h2>
              <p className="text-slate-300">{doctor.specialty} • {hospitalName}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
                Consultation Fee: ₹{doctor.consultationFee}
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex justify-center">
            <div className="flex items-center w-full max-w-md">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
              <div className={`h-1 flex-grow mx-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-100'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
              <div className={`h-1 flex-grow mx-2 rounded-full ${step >= 3 ? 'bg-green-500' : 'bg-slate-100'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit}>
              <AnimatePresence mode="wait">
                {/* STEP 1: Details */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Appointment Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Select Date</label>
                        <div className="relative">
                          <input 
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.date}
                            onChange={e => {
                              setFormData({ ...formData, date: e.target.value, timeSlot: '' });
                            }}
                          />
                        </div>
                        {formData.date && !doctor.availability?.find(a => a.date === formData.date)?.slots?.length && (
                          <p className="text-sm text-red-500 mt-1 font-medium">No slots available on this date.</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Select Time Slot</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <select 
                            required
                            disabled={!formData.date || !doctor.availability?.find(a => a.date === formData.date)?.slots?.length}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                            value={formData.timeSlot}
                            onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                          >
                            <option value="">Choose a time</option>
                            {formData.date && doctor.availability?.find(a => a.date === formData.date)?.slots?.map(slot => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Consultation Type</label>
                      <div className="flex gap-4">
                        <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${formData.consultationType === 'In-Person' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}>
                          <input type="radio" name="consultationType" value="In-Person" className="hidden" onChange={(e) => setFormData({...formData, consultationType: e.target.value})} checked={formData.consultationType === 'In-Person'} />
                          In-Person Visit
                        </label>
                        <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${formData.consultationType === 'Online Video Call' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}>
                          <input type="radio" name="consultationType" value="Online Video Call" className="hidden" onChange={(e) => setFormData({...formData, consultationType: e.target.value})} checked={formData.consultationType === 'Online Video Call'} />
                          Online Video Call
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Describe Symptoms</label>
                      <textarea 
                        required
                        placeholder="Please briefly describe your symptoms..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                        value={formData.symptoms}
                        onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                      />
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                        Proceed to Payment
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Payment */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center"><CreditCard className="mr-2" /> Payment Summary</h3>
                    
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                      <div className="flex justify-between mb-4">
                        <span className="text-slate-600">Consultation with {doctor.name}</span>
                        <span className="font-bold text-slate-800">₹{doctor.consultationFee}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span className="text-slate-600">Booking Token Fee (UPI Only)</span>
                        <span className="font-bold text-slate-800">₹{tokenFee}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">* The token fee secures your appointment slot. The remaining amount will be paid at the hospital.</p>
                      <hr className="border-slate-200 my-4" />
                      <div className="flex justify-between text-lg">
                        <span className="font-bold text-slate-800">Total to Pay Now</span>
                        <span className="font-black text-blue-600">₹{tokenFee}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <Smartphone size={20} />
                      </div>
                      <p className="text-sm font-medium text-blue-800">Payments are securely processed via Razorpay. We only accept UPI methods (GPay, PhonePe, Paytm, etc.).</p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-between">
                      <button type="button" onClick={() => setStep(1)} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800">Back</button>
                      <button 
                        type="button" 
                        onClick={initRazorpay} 
                        disabled={loading} 
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                      >
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {loading ? 'Processing...' : `Pay ₹${tokenFee} & Confirm`}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Success */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4">Appointment Confirmed! ✅</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Your appointment with {doctor.name} is scheduled for {formData.date} at {formData.timeSlot}. A confirmation has been sent to your dashboard.</p>
                    
                    <div className="flex justify-center gap-4">
                      <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                        Go to Dashboard
                      </button>
                      <button onClick={() => navigate('/doctors')} className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                        Book Another
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
