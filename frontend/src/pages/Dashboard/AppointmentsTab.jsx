import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, XCircle } from 'lucide-react';

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
        <thead className="bg-slate-50 text-slate-500 text-sm">
          <tr>
            <th className="p-4 font-medium">Hospital</th>
            <th className="p-4 font-medium">Doctor</th>
            <th className="p-4 font-medium">Date & Time</th>
            <th className="p-4 font-medium">Payment</th>
            <th className="p-4 font-medium">Status</th>
            {isUpcoming && <th className="p-4 font-medium text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {data.length === 0 ? (
            <tr><td colSpan={isUpcoming ? "6" : "5"} className="p-6 text-center text-slate-500 bg-slate-50/50">No appointments found.</td></tr>
          ) : (
            data.map(app => (
              <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={app._id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-900">{app.hospitalName || 'Unknown Hospital'}</div>
                  {app.hospitalName && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(app.hospitalName)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center mt-1"
                    >
                      <MapPin size={12} className="mr-1" /> View Directions
                    </a>
                  )}
                </td>
                <td className="p-4">
                  <div className="text-slate-900 font-medium">{app.doctor?.name || 'N/A'}</div>
                  <div className="text-xs text-slate-500">{app.doctor?.specialty}</div>
                </td>
                <td className="p-4 text-slate-600 font-medium">
                  {new Date(app.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}<br/>
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{app.timeSlot}</span>
                </td>
                <td className="p-4">{getPaymentBadge(app.paymentStatus)}</td>
                <td className="p-4">{getStatusBadge(app.status)}</td>
                {isUpcoming && (
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => onCancel(app._id)} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-semibold">
                      Cancel
                    </button>
                  </td>
                )}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold text-slate-900 flex items-center"><Clock size={20} className="mr-2 text-blue-600" /> Upcoming Appointments</h2>
        </div>
        {renderTable(upcoming, true)}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden opacity-80">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center"> Past & Cancelled</h2>
        </div>
        {renderTable(past, false)}
      </div>
    </div>
  );
}
