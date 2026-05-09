import { Activity, Heart, Moon, Droplet } from 'lucide-react';

export default function OverviewTab({ appointments, records, user }) {
  const todayDateStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
  const upcoming = appointments.filter(a => {
    // Treat the stored UTC 'YYYY-MM-DD' strictly as local midnight
    const appDateStr = new Date(a.date).toISOString().split('T')[0];
    return appDateStr >= todayDateStr && a.status !== 'Cancelled' && a.status !== 'Completed';
  });
  const insights = [
    { title: 'Heart Rate', value: user?.heartRate ? `${user.heartRate} bpm` : '-- bpm', status: 'Normal', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { title: 'Blood Sugar', value: user?.bloodSugar ? `${user.bloodSugar} mg/dL` : '-- mg/dL', status: 'Normal', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Sleep Score', value: user?.sleepScore ? `${user.sleepScore}/100` : '--/100', status: 'Good', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-sm md:col-span-1">
          <h2 className="text-2xl font-bold mb-2">Hello, {user?.name}!</h2>
          <p className="text-blue-100 text-sm">Your health dashboard is ready.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Appointments</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{appointments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Reports</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{records?.length || 0}</p>
        </div>
      </div>

      {/* Health Insights */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Health Insights</h3>
        <div className="grid grid-cols-3 gap-6">
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                <Icon className={`${insight.color} mb-3`} size={32} />
                <p className="text-sm text-slate-500 font-bold">{insight.title}</p>
                <p className="text-2xl font-black text-slate-900">{insight.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layout for Appointments & Reports */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Upcoming Appointments</h3>
          <div className="space-y-4">
            {upcoming.length === 0 ? (
              <div className="bg-slate-50 p-6 rounded-2xl text-center text-slate-500 border border-dashed border-slate-200">No upcoming appointments.</div>
            ) : (
              upcoming.slice(0, 3).map(app => (
                <div key={app._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
                  <div className="bg-blue-50 text-blue-600 rounded-xl p-3 text-center min-w-[70px] shrink-0">
                    <p className="text-xs font-bold uppercase">{new Date(app.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-xl font-black">{new Date(app.date).getDate()}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{app.symptoms}</h4>
                    <p className="text-sm text-slate-500">{app.doctor?.name} • {app.hospitalName}</p>
                    <p className="text-xs text-blue-600 font-bold mt-1 bg-blue-50 px-2 py-0.5 rounded w-max">{app.timeSlot}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Latest Reports</h3>
          <div className="space-y-4">
            {!records || records.length === 0 ? (
              <div className="bg-slate-50 p-6 rounded-2xl text-center text-slate-500 border border-dashed border-slate-200">No recent reports.</div>
            ) : (
              records.slice(0, 3).map(rec => (
                <div key={rec._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">{rec.title}</h4>
                    <p className="text-xs text-slate-500">{new Date(rec.date).toLocaleDateString()}</p>
                  </div>
                  <a href={`http://localhost:5000${rec.fileUrl}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                    Download
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
