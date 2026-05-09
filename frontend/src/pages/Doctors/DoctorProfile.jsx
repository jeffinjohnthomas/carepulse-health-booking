import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, FileText, Smartphone, X, Loader } from 'lucide-react';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slot, setSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // In a real app, fetch doctor by ID
  const doctor = { name: 'Dr. Sarah Jenkins', specialty: 'Cardiologist', fee: 150 };

  const handleBookingClick = (e) => {
    e.preventDefault();
    if (!slot) return alert("Please select a time slot");
    setShowPayment(true);
  };

  const handlePayment = (method) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPayment(false);
      navigate('/appointment-letter', { state: { doctor, slot, notes, paymentMethod: method } });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        {/* Left: Info */}
        <div className="md:w-1/3 bg-slate-50 p-8 border-r border-slate-100">
          <div className="w-32 h-32 bg-blue-100 rounded-3xl mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-center text-slate-900">{doctor.name}</h2>
          <p className="text-center text-teal-600 font-medium mb-6">{doctor.specialty}</p>
          <div className="bg-white p-4 rounded-xl text-center shadow-sm">
            <span className="block text-sm text-slate-500 mb-1">Consultation Fee</span>
            <span className="text-3xl font-bold text-slate-900">${doctor.fee}</span>
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="md:w-2/3 p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center"><Calendar className="mr-2 text-blue-600"/> Schedule Appointment</h3>
          
          <form onSubmit={handleBookingClick} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Available Slot</label>
              <div className="grid grid-cols-3 gap-3">
                {['09:00 AM', '11:30 AM', '02:00 PM', '04:15 PM'].map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSlot(s)}
                    className={`py-2 rounded-lg border text-sm font-medium transition-all ${slot === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center"><FileText size={16} className="mr-1"/> Disease/Symptom Notes</label>
              <textarea 
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe your symptoms..."
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold flex justify-center items-center hover:bg-teal-600 transition-colors">
                <CreditCard className="mr-2" />
                Pay ${doctor.fee} & Book Now
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 relative"
            >
              <button onClick={() => setShowPayment(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Select Payment Method</h3>
                <p className="text-slate-500 mt-1">Amount to pay: <span className="font-bold text-slate-900">${doctor.fee}</span></p>
              </div>

              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader className="animate-spin text-teal-600 mb-4" size={40} />
                  <p className="text-slate-600 font-medium">Processing payment securely...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={() => handlePayment('GPay')}
                    className="w-full p-4 border border-slate-200 rounded-xl flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-6 object-contain" />
                  </button>
                  <button 
                    onClick={() => handlePayment('PhonePe')}
                    className="w-full p-4 border border-slate-200 rounded-xl flex items-center justify-center hover:border-purple-500 hover:bg-purple-50 hover:shadow-sm transition-all"
                  >
                    <img src="https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" alt="PhonePe" className="h-8 object-contain" />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
