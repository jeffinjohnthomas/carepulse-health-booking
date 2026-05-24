import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Users, UserPlus, Activity, Database, LayoutDashboard, Building2, Calendar, CreditCard, Trash2, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [hospitalForm, setHospitalForm] = useState({ name: '', city: '', address: '' });
  
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorForm, setDoctorForm] = useState({ name: '', specialty: '', experience: '', consultationFee: '', hospital: '', gender: 'Other' });

  const [showPromoteModal, setShowPromoteModal] = useState({ show: false, userId: null });
  const [promoteForm, setPromoteForm] = useState({ doctorId: '' });

  const [showDeleteModal, setShowDeleteModal] = useState({ show: false, entityId: null, entityType: null });

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchHospitals();
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsersList(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const { data } = await api.get('/admin/hospitals');
      setHospitals(data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/admin/doctors');
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/admin/bookings');
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const promoteToAdmin = async (id) => {
    try {
      await api.put(`/admin/users/${id}/promote-admin`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert('Failed to promote');
    }
  };

  const handlePromoteToDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${showPromoteModal.userId}/promote-doctor`, { doctorId: promoteForm.doctorId });
      fetchUsers();
      fetchStats();
      setShowPromoteModal({ show: false, userId: null });
      setPromoteForm({ doctorId: '' });
      alert('User successfully promoted to Doctor!');
    } catch (error) {
      alert('Failed to promote. Ensure Doctor Profile ID is correct.');
    }
  };

  const deleteEntity = (id, type) => {
    setShowDeleteModal({ show: true, entityId: id, entityType: type });
  };

  const confirmDelete = async () => {
    try {
      const { entityId, entityType } = showDeleteModal;
      await api.delete(`/admin/${entityType}s/${entityId}`);
      if (entityType === 'user') { fetchUsers(); fetchStats(); }
      else if (entityType === 'doctor') { fetchDoctors(); fetchStats(); }
      else if (entityType === 'hospital') { fetchHospitals(); fetchStats(); }
      
      setShowDeleteModal({ show: false, entityId: null, entityType: null });
    } catch (error) {
      alert(error.response?.data?.message || `Failed to delete ${showDeleteModal.entityType}`);
    }
  };

  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/hospitals', { ...hospitalForm, state: 'N/A' });
      fetchHospitals();
      setShowHospitalModal(false);
      setHospitalForm({ name: '', city: '', address: '' });
    } catch (error) {
      alert('Failed to add hospital');
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/doctors', {
        ...doctorForm,
        experience: Number(doctorForm.experience),
        consultationFee: Number(doctorForm.consultationFee)
      });
      fetchDoctors();
      setShowDoctorModal(false);
      setDoctorForm({ name: '', specialty: '', experience: '', consultationFee: '', hospital: '', gender: 'Other' });
    } catch (error) {
      alert('Failed to add doctor');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'User Management', icon: <Users size={20} /> },
    { id: 'doctors', label: 'Doctors', icon: <Activity size={20} /> },
    { id: 'hospitals', label: 'Hospitals', icon: <Building2 size={20} /> },
    { id: 'appointments', label: 'Appointments & Payments', icon: <Calendar size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="fixed top-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto px-4 py-12 max-w-7xl flex flex-col md:flex-row gap-8 relative z-10">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-lg shadow-slate-200/50 border border-white p-6 sticky top-24">
            <h2 className="text-xl font-black text-slate-800 mb-8 px-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-slate-400/50"><LayoutDashboard size={16}/></span>
              Admin Control
            </h2>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm relative group ${
                    activeTab === tab.id
                      ? 'text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div layoutId="admin-active-tab" className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl z-0" />
                  )}
                  <span className="relative z-10 flex items-center space-x-3">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform group-hover:scale-150 transition-transform duration-700"></div>
              <h1 className="text-4xl font-black mb-2 relative z-10">Dashboard Overview</h1>
              <p className="text-slate-300 font-medium relative z-10">System metrics and high-level statistics.</p>
            </div>
            
            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-100/50 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-fuchsia-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform"><Users size={28} /></div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Total Users</p>
                  <p className="text-4xl font-black text-slate-800">{stats.totalUsers}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-100/50 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform"><Activity size={28} /></div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Doctors</p>
                  <p className="text-4xl font-black text-slate-800">{stats.totalDoctors}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-100/50 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform"><Calendar size={28} /></div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Bookings</p>
                  <p className="text-4xl font-black text-slate-800">{stats.totalBookings}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-100/50 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform"><CreditCard size={28} /></div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Est. Revenue</p>
                  <p className="text-4xl font-black text-slate-800">₹{stats.revenue.toLocaleString()}</p>
                </motion.div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white/50 backdrop-blur-xl rounded-[2rem] font-bold">Loading stats...</div>
            )}
          </motion.div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-black text-slate-800">User Management</h1>
              <p className="text-slate-500 font-medium">Manage all registered accounts, promote users, or revoke access.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-100/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-100/50">
                    <tr>
                      <th className="p-5">Name</th>
                      <th className="p-5">Email</th>
                      <th className="p-5">Role</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 text-sm">
                    {loading ? (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-400 italic bg-slate-50/20">Loading users...</td></tr>
                    ) : (
                      <AnimatePresence>
                        {usersList.map((u, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={u._id} 
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            <td className="p-5 font-bold text-slate-800">{u.name}</td>
                            <td className="p-5 text-slate-600 font-medium">{u.email}</td>
                            <td className="p-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-slate-800 text-white' : u.role === 'doctor' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                {u.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-5 space-x-2 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              {u.role === 'patient' && (
                                <>
                                  <button onClick={() => setShowPromoteModal({ show: true, userId: u._id })} className="px-4 py-2 bg-white text-blue-600 rounded-xl shadow hover:shadow-md text-xs font-bold transition-all">Make Doctor</button>
                                  <button onClick={() => promoteToAdmin(u._id)} className="px-4 py-2 bg-white text-slate-800 rounded-xl shadow hover:shadow-md text-xs font-bold transition-all">Make Admin</button>
                                </>
                              )}
                              {u._id !== user._id && (
                                <button onClick={() => deleteEntity(u._id, 'user')} className="p-2 bg-white text-rose-500 shadow hover:shadow-md hover:bg-rose-500 hover:text-white rounded-xl transition-all" title="Delete User">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* DOCTORS TAB */}
        {activeTab === 'doctors' && (
          <motion.div 
            key="doctors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-800">Doctor Profiles</h1>
                <p className="text-slate-500 font-medium">Add custom doctor profiles so they can be linked to user accounts.</p>
              </div>
              <button 
                onClick={() => setShowDoctorModal(true)}
                className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all whitespace-nowrap"
              >
                + Add Doctor Profile
              </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-100/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-100/50">
                    <tr>
                      <th className="p-5">Name</th>
                      <th className="p-5">Specialty</th>
                      <th className="p-5">Experience</th>
                      <th className="p-5">Fee</th>
                      <th className="p-5">Profile ID (Copy this)</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 text-sm">
                    {doctors.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-400 italic bg-slate-50/20">No doctors added yet.</td></tr>
                    ) : (
                      <AnimatePresence>
                        {doctors.map((d, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={d._id} 
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            <td className="p-5 font-bold text-slate-800">{d.name}</td>
                            <td className="p-5 text-slate-600 font-medium">{d.specialty}</td>
                            <td className="p-5 text-slate-600 font-medium">{d.experience} yrs</td>
                            <td className="p-5 font-bold text-green-600">₹{d.consultationFee}</td>
                            <td className="p-5"><span className="text-slate-500 font-mono text-xs select-all bg-white border border-slate-200 px-3 py-1.5 rounded-lg inline-block shadow-sm">{d._id}</span></td>
                            <td className="p-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => deleteEntity(d._id, 'doctor')} className="p-2 bg-white text-rose-500 shadow hover:shadow-md hover:bg-rose-500 hover:text-white rounded-xl transition-all" title="Delete Doctor">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* HOSPITALS TAB */}
        {activeTab === 'hospitals' && (
          <motion.div 
            key="hospitals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-800">Hospital Management</h1>
                <p className="text-slate-500 font-medium">Create custom hospitals bypassing OpenStreetMap discovery.</p>
              </div>
              <button 
                onClick={() => setShowHospitalModal(true)}
                className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all whitespace-nowrap"
              >
                + Add Custom Hospital
              </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-100/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-100/50">
                    <tr>
                      <th className="p-5">Hospital Name</th>
                      <th className="p-5">City</th>
                      <th className="p-5">Type</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 text-sm">
                    {hospitals.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-400 italic bg-slate-50/20">No custom hospitals added yet.</td></tr>
                    ) : (
                      <AnimatePresence>
                        {hospitals.map((h, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={h._id} 
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            <td className="p-5 font-bold text-slate-800">{h.name}</td>
                            <td className="p-5 text-slate-600 font-medium">{h.city}</td>
                            <td className="p-5">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">Custom Entry</span>
                            </td>
                            <td className="p-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => deleteEntity(h._id, 'hospital')} className="p-2 bg-white text-rose-500 shadow hover:shadow-md hover:bg-rose-500 hover:text-white rounded-xl transition-all" title="Delete Hospital">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <motion.div 
            key="appointments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-black text-slate-800">Appointments & Payments</h1>
              <p className="text-slate-500 font-medium">Master ledger for all system transactions and bookings.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-100/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-100/50">
                    <tr>
                      <th className="p-5">Patient</th>
                      <th className="p-5">Doctor</th>
                      <th className="p-5">Date & Time</th>
                      <th className="p-5">Payment</th>
                      <th className="p-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 text-sm">
                    {appointments.length === 0 ? (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic bg-slate-50/20">No appointments recorded yet.</td></tr>
                    ) : (
                      <AnimatePresence>
                        {appointments.map((a, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={a._id} 
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            <td className="p-5 font-bold text-slate-800">{a.user?.name}</td>
                            <td className="p-5 text-slate-600 font-medium">{a.doctor?.name || 'N/A'}</td>
                            <td className="p-5 text-slate-600 font-medium">{new Date(a.date).toLocaleDateString()} <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md ml-1 inline-block shadow-sm">{a.timeSlot}</span></td>
                            <td className="p-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                a.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                                {a.paymentStatus}
                              </span>
                            </td>
                            <td className="p-5 text-right font-black text-slate-500 group-hover:text-blue-600 transition-colors uppercase tracking-wider text-xs">{a.status}</td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

      </div>
    </div>

      {/* --- MODALS --- */}

      {/* Hospital Modal */}
      {showHospitalModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">Add Custom Hospital</h3>
              <button onClick={() => setShowHospitalModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleAddHospital} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Hospital Name</label>
                <input required type="text" value={hospitalForm.name} onChange={e => setHospitalForm({...hospitalForm, name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                <input required type="text" value={hospitalForm.city} onChange={e => setHospitalForm({...hospitalForm, city: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Address</label>
                <input required type="text" value={hospitalForm.address} onChange={e => setHospitalForm({...hospitalForm, address: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-4 rounded-xl font-bold mt-4 shadow-lg hover:shadow-xl transition-shadow text-lg">Save Hospital</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">Create Doctor Profile</h3>
              <button onClick={() => setShowDoctorModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Doctor Name (e.g., Dr. Smith)</label>
                <input required type="text" value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Specialty</label>
                  <input required type="text" value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Experience (Yrs)</label>
                  <input required type="number" value={doctorForm.experience} onChange={e => setDoctorForm({...doctorForm, experience: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Gender</label>
                  <select value={doctorForm.gender} onChange={e => setDoctorForm({...doctorForm, gender: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Consultation Fee (₹)</label>
                  <input required type="number" value={doctorForm.consultationFee} onChange={e => setDoctorForm({...doctorForm, consultationFee: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Hospital (Name or ID)</label>
                <input required type="text" value={doctorForm.hospital} onChange={e => setDoctorForm({...doctorForm, hospital: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-4 rounded-xl font-bold mt-4 shadow-lg hover:shadow-xl transition-shadow text-lg">Save Doctor Profile</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Promote Modal */}
      {showPromoteModal.show && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">Link Doctor Profile</h3>
              <button onClick={() => setShowPromoteModal({ show: false, userId: null })} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-6 font-medium">To promote this user to a Doctor, you must link them to an existing Doctor Profile ID.</p>
            <form onSubmit={handlePromoteToDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Doctor Profile ID</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Paste ID from the Doctors tab..."
                  value={promoteForm.doctorId} 
                  onChange={e => setPromoteForm({ doctorId: e.target.value })} 
                  className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none font-mono text-sm" 
                />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold mt-4 shadow-lg hover:shadow-xl transition-shadow text-lg">Promote to Doctor</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal.show && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Trash2 size={40} />
            </div>
            <h3 className="text-2xl font-black mb-2 text-slate-800 capitalize">Delete {showDeleteModal.entityType}?</h3>
            <p className="text-slate-500 mb-8 font-medium">Are you sure you want to permanently remove this {showDeleteModal.entityType} from the system? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal({ show: false, entityId: null, entityType: null })}
                className="flex-1 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
