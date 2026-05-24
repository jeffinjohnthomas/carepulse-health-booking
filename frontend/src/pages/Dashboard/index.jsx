import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CalendarDays, FileText, Pill, Settings, LogOut, Bot } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

import OverviewTab from './OverviewTab';
import AppointmentsTab from './AppointmentsTab';
import RecordsTab from './RecordsTab';
import PrescriptionsTab from './PrescriptionsTab';
import SettingsTab from './SettingsTab';
import AITab from './AITab';

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalId, setCancelModalId] = useState(null);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/mybookings');
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchRecords = async () => {
    try {
      const { data } = await api.get('/records');
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const { data } = await api.get('/prescriptions');
      setPrescriptions(data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchBookings(), fetchRecords(), fetchPrescriptions()]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchAllData();
  }, [user]);

  const confirmCancel = async () => {
    if (!cancelModalId) return;
    try {
      await api.put(`/bookings/${cancelModalId}/cancel`);
      fetchBookings();
      setCancelModalId(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel appointment');
      setCancelModalId(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays },
    { id: 'records', label: 'Health Records', icon: FileText },
    { id: 'ai', label: 'AI Analysis', icon: Bot },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-40 -left-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white sticky top-28">
            <div className="mb-8 p-4 text-center border-b border-slate-100/50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-inner">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500">Patient Account</p>
            </div>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' 
                        : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-800'
                    }`}
                  >
                    <Icon size={18} className={`mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors mt-4"
              >
                <LogOut size={18} className="mr-3" />
                Log Out
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab appointments={appointments} records={records} user={user} />}
              {activeTab === 'appointments' && <AppointmentsTab appointments={appointments} onCancel={setCancelModalId} />}
              {activeTab === 'records' && <RecordsTab records={records} fetchRecords={fetchRecords} />}
              {activeTab === 'ai' && <AITab />}
              {activeTab === 'prescriptions' && <PrescriptionsTab prescriptions={prescriptions} />}
              {activeTab === 'settings' && <SettingsTab user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelModalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Cancel Appointment?</h3>
              <p className="text-slate-500 mb-8">Are you sure you want to cancel this appointment? This action cannot be undone and your slot will be released.</p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setCancelModalId(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
