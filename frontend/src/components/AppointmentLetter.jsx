import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Home } from 'lucide-react';

export default function AppointmentLetter() {
  const { state } = useLocation();

  if (!state) return <div className="text-center py-20">No appointment found.</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8"
      >
        <div className="text-center mb-8 border-b border-slate-100 pb-8">
          <CheckCircle size={64} className="text-teal-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">Payment Successful!</h1>
          <p className="text-slate-500 mt-2">Your consultation appointment is confirmed.</p>
        </div>

        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-bold border-b pb-2">Official Appointment Letter</h2>
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
            <span className="text-slate-500">Doctor</span>
            <span className="font-bold text-slate-900">{state.doctor.name} ({state.doctor.specialty})</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
            <span className="text-slate-500">Date & Time</span>
            <span className="font-bold text-slate-900">Today, {state.slot}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
            <span className="text-slate-500">Amount Paid</span>
            <span className="font-bold text-green-600">${state.doctor.fee}.00 via {state.paymentMethod || 'Online'}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl">
            <span className="text-slate-500 block mb-2">Patient Notes</span>
            <p className="text-slate-900 italic">"{state.notes}"</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium flex items-center justify-center hover:bg-blue-100 transition-colors">
            <Download size={18} className="mr-2"/> Download PDF
          </button>
          <Link to="/" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium flex items-center justify-center hover:bg-slate-800 transition-colors">
            <Home size={18} className="mr-2"/> Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
