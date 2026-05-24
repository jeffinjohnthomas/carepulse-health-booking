import { useState, useEffect } from 'react';
import { Activity, Heart, Moon, Droplet, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

export default function OverviewTab({ appointments, records, user, fetchUser }) {
  const [metrics, setMetrics] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [formData, setFormData] = useState({ heartRate: '', bloodSugar: '', sleepScore: '' });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data } = await api.get('/health-metrics');
      
      // Always generate the last 7 days so the chart can draw a line even with 1 data point
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      });

      // Group fetched data by weekday
      const dataMap = {};
      data.forEach(m => {
        const day = new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' });
        dataMap[day] = {
          heartRate: m.heartRate || null,
          sleepScore: m.sleepScore || null,
          bloodSugar: m.bloodSugar || null
        };
      });

      // Merge into a continuous 7-day array
      const formattedData = last7Days.map(day => ({
        name: day,
        heartRate: dataMap[day]?.heartRate || 0,
        sleepScore: dataMap[day]?.sleepScore || 0,
        bloodSugar: dataMap[day]?.bloodSugar || 0,
      }));

      setMetrics(formattedData);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/health-metrics', {
        heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
        bloodSugar: formData.bloodSugar ? Number(formData.bloodSugar) : undefined,
        sleepScore: formData.sleepScore ? Number(formData.sleepScore) : undefined,
      });
      setShowLogModal(false);
      setFormData({ heartRate: '', bloodSugar: '', sleepScore: '' });
      fetchMetrics();
      if (fetchUser) fetchUser(); // Optional: trigger user context update if passed from Dashboard
    } catch (err) {
      console.error('Failed to log metrics:', err);
    }
  };

  const todayDateStr = new Date().toLocaleDateString('en-CA');
  const upcoming = appointments.filter(a => {
    const appDateStr = new Date(a.date).toISOString().split('T')[0];
    return appDateStr >= todayDateStr && a.status !== 'Cancelled' && a.status !== 'Completed';
  });

  const insights = [
    { title: 'Avg Heart Rate', value: user?.heartRate ? `${user.heartRate} bpm` : '72 bpm', status: 'Normal', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { title: 'Blood Sugar', value: user?.bloodSugar ? `${user.bloodSugar} mg/dL` : '95 mg/dL', status: 'Normal', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Sleep Score', value: user?.sleepScore ? `${user.sleepScore}/100` : '85/100', status: 'Good', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-8 rounded-[2rem] shadow-xl md:col-span-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-700"></div>
          <h2 className="text-3xl font-black mb-2 relative z-10">Hello, {user?.name}!</h2>
          <p className="text-blue-100 text-sm font-medium relative z-10">Your health dashboard is ready.</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-100/50 flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Appointments</p>
          <p className="text-5xl font-black text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{appointments.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-100/50 flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Reports</p>
          <p className="text-5xl font-black text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-500">{records?.length || 0}</p>
        </div>
      </div>

      {/* Health Insights & Chart */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-bold text-slate-800">Current Vitals</h3>
            <button onClick={() => setShowLogModal(true)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors" title="Log Vitals">
              <Plus size={20} />
            </button>
          </div>
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`${insight.bg} p-4 rounded-2xl`}>
                  <Icon className={`${insight.color}`} size={28} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{insight.title}</p>
                  <p className="text-2xl font-black text-slate-800">{insight.value}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Health Trends (Weekly)</h3>
          <div className="h-64 w-full">
            {metrics.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Activity size={48} className="mb-4 opacity-50" />
                <p>No health data logged this week.</p>
                <button onClick={() => setShowLogModal(true)} className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors">Log Vitals Now</button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="sleepScore" name="Sleep Score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSleep)" />
                  <Area type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorHeart)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
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

      {/* Log Metrics Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Log Daily Vitals</h3>
              <form onSubmit={handleLogSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Heart Rate (bpm)</label>
                  <input type="number" min="0" max="300" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600" value={formData.heartRate} onChange={(e) => setFormData({...formData, heartRate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Blood Sugar (mg/dL)</label>
                  <input type="number" min="0" max="1000" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600" value={formData.bloodSugar} onChange={(e) => setFormData({...formData, bloodSugar: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Sleep Score (0-100)</label>
                  <input type="number" min="0" max="100" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600" value={formData.sleepScore} onChange={(e) => setFormData({...formData, sleepScore: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowLogModal(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Save Vitals</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
