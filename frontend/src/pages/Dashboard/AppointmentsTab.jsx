import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, MapPin, XCircle, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AppointmentsTab({ appointments, onCancel }) {
  const getStatusBadge = (status) => {
    if (!status) return null;
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'completed') return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold w-max flex items-center"><CheckCircle size={12} className="mr-1" /> {status}</span>;
    if (lowerStatus === 'cancelled' || lowerStatus === 'no-show') return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold w-max flex items-center"><XCircle size={12} className="mr-1" /> {status}</span>;
    return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold w-max flex items-center"><Clock size={12} className="mr-1" /> {status}</span>;
  };

  const getPaymentBadge = (status) => {
    if (!status) return null;
    if (status.toLowerCase() === 'paid') return <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-semibold border border-green-100">{status}</span>;
    return <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs font-semibold border border-orange-100">{status}</span>;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parseDate = (dateStr) => {
    // dateStr format is YYYY-MM-DD
    const [year, month, day] = dateStr.split('-');
    return new Date(year, month - 1, day);
  };

  const upcoming = appointments.filter(a => parseDate(a.date) >= today && a.status !== 'Cancelled' && a.status !== 'Completed');
  const past = appointments.filter(a => parseDate(a.date) < today || a.status === 'Cancelled' || a.status === 'Completed');

  const renderTable = (data, isUpcoming) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-100/50">
          <tr>
            <th className="p-5 font-bold tracking-wider uppercase text-xs">Hospital</th>
            <th className="p-5 font-bold tracking-wider uppercase text-xs">Doctor</th>
            <th className="p-5 font-bold tracking-wider uppercase text-xs">Date & Time</th>
            <th className="p-5 font-bold tracking-wider uppercase text-xs">Payment</th>
            <th className="p-5 font-bold tracking-wider uppercase text-xs">Status</th>
            {isUpcoming && <th className="p-5 font-bold tracking-wider uppercase text-xs text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/50 text-sm">
          {data.length === 0 ? (
            <tr><td colSpan={isUpcoming ? "6" : "5"} className="p-8 text-center text-slate-400 bg-slate-50/20 italic">No appointments found.</td></tr>
          ) : (
            <AnimatePresence>
              {data.map((app, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  key={app._id} 
                  className="hover:bg-blue-50/50 transition-colors group"
                >
                  <td className="p-5">
                    <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{app.hospitalName || 'Unknown Hospital'}</div>
                  {app.hospitalName && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(app.hospitalName)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-blue-600 flex items-center mt-1 transition-colors"
                    >
                      <MapPin size={12} className="mr-1" /> View Directions
                    </a>
                  )}
                </td>
                <td className="p-5">
                  <div className="text-slate-800 font-bold">{app.doctor?.name || 'N/A'}</div>
                  <div className="text-xs text-slate-500 font-medium">{app.doctor?.specialty}</div>
                </td>
                <td className="p-5 text-slate-600 font-medium">
                  {new Date(app.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}<br/>
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 mt-1 inline-block">{app.timeSlot}</span>
                  <div className="mt-1 flex flex-col gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-max ${app.consultationType === 'Online Video Call' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                      {app.consultationType === 'Online Video Call' ? <><Video size={10} className="inline mr-1"/>{app.consultationType}</> : app.consultationType}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded w-max">{app.visitType}</span>
                  </div>
                </td>
                <td className="p-5">{getPaymentBadge(app.paymentStatus)}</td>
                <td className="p-5">{getStatusBadge(app.status)}</td>
                {isUpcoming && (
                  <td className="p-5 text-right space-x-2">
                    {app.status === 'Pending' && (
                      <span className="text-xs text-slate-400 italic mr-2 flex-grow">Awaiting confirmation</span>
                    )}
                    <div className="flex justify-end gap-2 items-center w-full">
                      {app.consultationType === 'Online Video Call' && app.status !== 'Pending' && (
                        <Link to={`/telemedicine/${app._id}`} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow hover:shadow-md rounded-xl transition-all text-xs font-bold flex items-center">
                          <Video size={14} className="mr-1" /> Join Call
                        </Link>
                      )}
                      <button onClick={() => onCancel(app._id)} className="px-4 py-2 bg-white text-rose-600 hover:bg-rose-500 hover:text-white shadow hover:shadow-md border border-slate-100 rounded-xl transition-all text-xs font-bold">
                        Cancel
                      </button>
                    </div>
                  </td>
                )}
                </motion.tr>
              ))}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-100/50 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100/50 bg-white/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center"><Clock size={22} className="mr-3 text-blue-600" /> Upcoming Appointments</h2>
        </div>
        {renderTable(upcoming, true)}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/50 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-100/50 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100/50 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center"> Past & Cancelled</h2>
        </div>
        {renderTable(past, false)}
      </motion.div>
    </div>
  );
}
