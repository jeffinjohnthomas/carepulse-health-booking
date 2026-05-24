import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Calendar, CheckCircle, Clock, FileText, LayoutDashboard, User, Check, X, Plus, Trash2, Users, Edit3, FilePlus, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function DoctorDashboard() {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [notesModal, setNotesModal] = useState({ isOpen: false, appointmentId: null, notes: '' });
  const [rxModal, setRxModal] = useState({ isOpen: false, appointmentId: null, userId: null, medicines: [{ name: '', dosage: '', duration: '' }], notes: '' });

  // Form states
  const [profileForm, setProfileForm] = useState({ 
    name: '', specialty: '', experience: '', hospital: '', imageUrl: '', gender: 'Other'
  });
  const [availabilityForm, setAvailabilityForm] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, appRes, statsRes, patientsRes] = await Promise.all([
        api.get('/doctor-dashboard/profile'),
        api.get('/doctor-dashboard/appointments'),
        api.get('/doctor-dashboard/stats'),
        api.get('/doctor-dashboard/patients')
      ]);

      const profileData = profileRes.data;
      setProfile(profileData);
      setProfileForm({
        name: profileData.name || '',
        specialty: profileData.specialty || '',
        experience: profileData.experience || '',
        hospital: profileData.hospitalName || profileData.hospital || '',
        imageUrl: profileData.imageUrl || '',
        gender: profileData.gender || 'Other'
      });
      setAvailabilityForm(profileData.availability || []);
      
      setAppointments(appRes.data);
      setStats(statsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Appointments Handlers ---
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/doctor-dashboard/appointments/${id}/status`, { status });
      fetchDashboardData();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleSaveNotes = async () => {
    try {
      await api.put(`/doctor-dashboard/appointments/${notesModal.appointmentId}/notes`, { notes: notesModal.notes });
      fetchDashboardData();
      setNotesModal({ isOpen: false, appointmentId: null, notes: '' });
      showToast('Notes saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save notes', 'error');
    }
  };

  const handleSavePrescription = async () => {
    try {
      const payload = {
        userId: rxModal.userId,
        bookingId: rxModal.appointmentId,
        medicines: rxModal.medicines.filter(m => m.name.trim() !== ''),
        notes: rxModal.notes
      };
      await api.post('/prescriptions', payload);
      setRxModal({ isOpen: false, appointmentId: null, userId: null, medicines: [{ name: '', dosage: '', duration: '' }], notes: '' });
      showToast('Prescription sent to patient!', 'success');
    } catch (error) {
      showToast('Failed to send prescription', 'error');
    }
  };

  const handleRxMedicineChange = (index, field, value) => {
    const newMeds = [...rxModal.medicines];
    newMeds[index][field] = value;
    setRxModal({ ...rxModal, medicines: newMeds });
  };

  // --- Profile Handlers ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/doctor-dashboard/profile', profileForm);
      fetchDashboardData();
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  };

  // --- Availability Handlers ---
  const handleAddSlot = () => {
    if (!newDate || !newSlot) return showToast('Please provide both date and time slot', 'error');
    
    const updatedAvailability = [...availabilityForm];
    const dateIndex = updatedAvailability.findIndex(a => a.date === newDate);
    
    if (dateIndex >= 0) {
      if (!updatedAvailability[dateIndex].slots.includes(newSlot)) {
        updatedAvailability[dateIndex].slots.push(newSlot);
      }
    } else {
      updatedAvailability.push({ date: newDate, slots: [newSlot] });
    }
    
    setAvailabilityForm(updatedAvailability);
    setNewSlot('');
  };

  const handleRemoveSlot = (dateStr, slotStr) => {
    // In a real app, you'd verify if the slot is already booked before removing it visually.
    const updatedAvailability = availabilityForm.map(a => {
      if (a.date === dateStr) {
        return { ...a, slots: a.slots.filter(s => s !== slotStr) };
      }
      return a;
    }).filter(a => a.slots.length > 0);
    
    setAvailabilityForm(updatedAvailability);
  };

  const saveAvailability = async () => {
    try {
      await api.put('/doctor-dashboard/availability', { availability: availabilityForm });
      fetchDashboardData();
      showToast('Availability saved successfully! This is now live for patients.', 'success');
    } catch (error) {
      showToast('Failed to save availability', 'error');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'patients', label: 'My Patients', icon: <Users size={20} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={20} /> },
    { id: 'availability', label: 'Availability', icon: <Clock size={20} /> },
    { id: 'profile', label: 'Profile Settings', icon: <User size={20} /> },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Doctor Panel...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto px-4 py-12 max-w-7xl flex flex-col md:flex-row gap-8 relative z-10">
        {/* Sidebar Navigation */}
      <div className="w-full md:w-72 flex-shrink-0">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-lg shadow-slate-200/50 border border-white p-6 sticky top-24 text-center">
          {profile?.imageUrl && profile.imageUrl !== 'default-doctor.jpg' ? (
            <div className="relative w-28 h-28 mx-auto mb-4 group">
              <div className="absolute inset-0 bg-blue-600 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img src={profile.imageUrl} alt="Profile" className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-md" />
            </div>
          ) : (
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-4 text-4xl font-black shadow-lg shadow-blue-500/30 border-4 border-white relative">
              {profile?.name?.charAt(0) || user?.name?.charAt(0) || 'D'}
            </div>
          )}
          <h2 className="text-2xl font-black text-slate-800">{profile?.name || user?.name}</h2>
          <p className="text-sm font-bold text-blue-600 mb-6 bg-blue-50 py-1 px-3 rounded-full inline-block mt-2">{profile?.specialty || 'General Practitioner'}</p>
          
          <nav className="space-y-1 text-left">
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
                  <motion.div layoutId="doc-active-tab" className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl z-0" />
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
        
        {/* DASHBOARD OVERVIEW TAB */}
        {activeTab === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform group-hover:scale-150 transition-transform duration-700"></div>
              <h1 className="text-4xl font-black mb-2 relative z-10">Dashboard Overview</h1>
              <p className="text-blue-100 font-medium relative z-10">Welcome back, {profile?.name || user?.name}. Here is your activity summary.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-100/50 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform"><Calendar size={28} /></div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Total Appointments</p>
                <p className="text-5xl font-black text-slate-800">{stats.total}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-100/50 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform"><Clock size={28} /></div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Upcoming</p>
                <p className="text-5xl font-black text-slate-800">{stats.upcoming}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-100/50 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform"><CheckCircle size={28} /></div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Completed</p>
                <p className="text-5xl font-black text-slate-800">{stats.completed}</p>
              </motion.div>
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
              <h1 className="text-3xl font-black text-slate-800">Appointments</h1>
              <p className="text-slate-500 font-medium">View and manage your patient consultations.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-100/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-100/50">
                    <tr>
                      <th className="p-5">Patient</th>
                      <th className="p-5">Date & Time</th>
                      <th className="p-5">Symptoms</th>
                      <th className="p-5">Payment</th>
                      <th className="p-5">Status</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 text-sm">
                    {appointments.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-400 italic bg-slate-50/20">No appointments found.</td></tr>
                    ) : (
                      <AnimatePresence>
                        {appointments.map((a, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={a._id} 
                            className="hover:bg-blue-50/50 transition-colors group"
                          >
                            <td className="p-5 font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{a.user?.name}</td>
                            <td className="p-5 text-slate-600 font-medium">
                              {new Date(a.date).toLocaleDateString()} <span className="bg-slate-100 px-2 py-0.5 rounded-md ml-1">{a.timeSlot}</span>
                              <div className="mt-1 flex flex-col gap-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-max ${a.consultationType === 'Online Video Call' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                  {a.consultationType === 'Online Video Call' ? <><Video size={10} className="inline mr-1"/>{a.consultationType}</> : a.consultationType}
                                </span>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded w-max">{a.visitType}</span>
                              </div>
                            </td>
                            <td className="p-5 text-slate-600 max-w-[150px] truncate" title={a.symptoms}>{a.symptoms}</td>
                            <td className="p-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                a.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                                {a.paymentStatus}
                              </span>
                            </td>
                            <td className="p-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                a.status === 'Completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                                a.status === 'In-Progress' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                a.status === 'Checked-In' ? 'bg-teal-100 text-teal-700 border border-teal-200' :
                                a.status === 'No-Show' ? 'bg-red-100 text-red-700 border border-red-200' :
                                a.status === 'Cancelled' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                                'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="p-5 space-x-2 flex flex-wrap gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            {(a.status === 'Pending' || a.status === 'Confirmed') && (
                              <>
                                <button onClick={() => updateStatus(a._id, 'Checked-In')} className="p-2 bg-white text-teal-600 hover:bg-teal-600 hover:text-white shadow hover:shadow-md rounded-xl text-xs font-bold transition-all" title="Mark Checked-In">Check In</button>
                                <button onClick={() => updateStatus(a._id, 'No-Show')} className="p-2 bg-white text-red-600 hover:bg-red-600 hover:text-white shadow hover:shadow-md rounded-xl text-xs font-bold transition-all" title="Mark No-Show"><X size={14} /></button>
                              </>
                            )}
                            
                            {a.consultationType === 'Online Video Call' && (a.status === 'Confirmed' || a.status === 'Checked-In' || a.status === 'In-Progress') && (
                              <Link to={`/telemedicine/${a._id}`} className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow hover:shadow-md rounded-xl text-xs font-bold transition-all flex items-center gap-1" title="Start Video Call">
                                <Video size={14} /> Call
                              </Link>
                            )}
                            {a.status === 'Checked-In' && (
                              <button onClick={() => updateStatus(a._id, 'In-Progress')} className="p-2 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white shadow hover:shadow-md rounded-xl text-xs font-bold transition-all" title="Start Consultation">Start</button>
                            )}
                            {a.status === 'In-Progress' && (
                              <button onClick={() => updateStatus(a._id, 'Completed')} className="p-2 bg-white text-green-600 hover:bg-green-600 hover:text-white shadow hover:shadow-md rounded-xl text-xs font-bold transition-all flex items-center gap-1" title="Mark Completed"><Check size={14} /> Complete</button>
                            )}
                            
                            {(a.status === 'Completed' || a.status === 'In-Progress') && (
                              <>
                                <button onClick={() => setNotesModal({ isOpen: true, appointmentId: a._id, notes: a.doctorNotes || '' })} className="p-2 bg-white text-blue-600 hover:bg-blue-600 hover:text-white shadow hover:shadow-md rounded-xl transition-all" title="Add Notes"><Edit3 size={16} /></button>
                                <button onClick={() => setRxModal({ isOpen: true, appointmentId: a._id, userId: a.user?._id, medicines: [{ name: '', dosage: '', duration: '' }], notes: '' })} className="p-2 bg-white text-purple-600 hover:bg-purple-600 hover:text-white shadow hover:shadow-md rounded-xl transition-all" title="Write Prescription"><FilePlus size={16} /></button>
                              </>
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

        {/* AVAILABILITY TAB */}
        {activeTab === 'availability' && (
          <motion.div 
            key="availability"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-black text-slate-800">Manage Availability</h1>
              <p className="text-slate-500 font-medium">Set the dates and time slots patients can book with you.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-100/50">
              <div className="flex flex-col md:flex-row gap-6 items-end mb-10 pb-8 border-b border-slate-100/50">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none transition-shadow bg-white/50" />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Time Slot (e.g. 09:00 AM)</label>
                  <input type="time" value={newSlot} onChange={e => setNewSlot(e.target.value)} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none transition-shadow bg-white/50" />
                </div>
                <button onClick={handleAddSlot} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] flex items-center transition-all w-full md:w-auto justify-center">
                  <Plus size={20} className="mr-2" /> Add Slot
                </button>
              </div>

              <h3 className="font-black text-xl text-slate-800 mb-6 flex items-center"><Clock className="mr-2 text-blue-600" size={24}/> Your Calendar Slots</h3>
              {availabilityForm.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 font-medium">No availability set. Please add time slots above.</div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {availabilityForm.sort((a, b) => new Date(a.date) - new Date(b.date)).map((avail, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className="bg-white/50 p-6 rounded-2xl border border-slate-100/80 flex flex-col md:flex-row gap-6 md:items-center shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="font-black text-slate-800 w-40 text-lg bg-blue-50/50 p-3 rounded-xl text-center border border-blue-100/50 text-blue-700">
                          {new Date(avail.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex-1 flex flex-wrap gap-3">
                          <AnimatePresence>
                            {avail.slots.map(slot => (
                              <motion.span 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                exit={{ scale: 0 }} 
                                key={slot} 
                                className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center text-slate-700 shadow-sm"
                              >
                                {slot}
                                <button onClick={() => handleRemoveSlot(avail.date, slot)} className="ml-3 text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors"><X size={14} /></button>
                              </motion.span>
                            ))}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <button onClick={saveAvailability} className="mt-10 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.01] transition-all text-lg">
                Save Calendar Changes
              </button>
            </div>
          </motion.div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-black text-slate-800">Profile Settings</h1>
              <p className="text-slate-500 font-medium">Update your public details shown to patients.</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-100/50 space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input required type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none transition-shadow bg-white/50" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Specialty</label>
                  <input required type="text" value={profileForm.specialty} onChange={e => setProfileForm({...profileForm, specialty: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none transition-shadow bg-white/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                  <select value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none transition-shadow bg-white/50">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Years of Experience</label>
                  <input required type="number" value={profileForm.experience} onChange={e => setProfileForm({...profileForm, experience: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none transition-shadow bg-white/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hospital Association</label>
                <input required type="text" value={profileForm.hospital} onChange={e => setProfileForm({...profileForm, hospital: e.target.value})} className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none transition-shadow bg-white/50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Profile Image URL</label>
                <input type="text" value={profileForm.imageUrl} onChange={e => setProfileForm({...profileForm, imageUrl: e.target.value})} placeholder="https://..." className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl outline-none transition-shadow bg-white/50" />
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.01] transition-all text-lg">
                Save Profile Updates
              </button>
            </form>
          </motion.div>
        )}

        {/* MY PATIENTS TAB */}
        {activeTab === 'patients' && (
          <motion.div 
            key="patients"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-black text-slate-800">My Patients</h1>
              <p className="text-slate-500 font-medium">A roster of all patients you have consulted.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patients.length === 0 ? (
                <div className="col-span-full p-12 bg-white/50 backdrop-blur-xl border border-slate-100/50 rounded-[2rem] text-center text-slate-400 font-medium">No patients yet.</div>
              ) : (
                <AnimatePresence>
                  {patients.map((p, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      key={p.user._id} 
                      className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-slate-100/50 flex flex-col hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center gap-5 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                          {p.user.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{p.user.name}</h3>
                          <p className="text-sm font-medium text-slate-500">{p.user.email}</p>
                          <p className="text-xs font-bold text-slate-400 mt-1">{p.user.phone}</p>
                        </div>
                      </div>
                      
                      <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-100/50">
                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Visits</p>
                          <p className="font-black text-slate-700 text-lg">{p.totalVisits}</p>
                        </div>
                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Last Visit</p>
                          <p className="font-black text-slate-700 text-sm mt-1">{new Date(p.latestVisit).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* NOTES MODAL */}
      {notesModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Clinical Notes</h3>
            <p className="text-slate-500 mb-6">These notes are private and attached to this booking.</p>
            <textarea 
              value={notesModal.notes} 
              onChange={e => setNotesModal({...notesModal, notes: e.target.value})}
              className="w-full h-32 px-4 py-3 border rounded-xl mb-6"
              placeholder="Enter patient notes, diagnosis, observations..."
            ></textarea>
            <div className="flex gap-4">
              <button onClick={() => setNotesModal({ isOpen: false, appointmentId: null, notes: '' })} className="flex-1 px-4 py-3 bg-slate-100 rounded-xl font-bold text-slate-700">Cancel</button>
              <button onClick={handleSaveNotes} className="flex-1 px-4 py-3 bg-blue-600 rounded-xl font-bold text-white shadow-lg">Save Notes</button>
            </div>
          </div>
        </div>
      )}

      {/* PRESCRIPTION MODAL */}
      {rxModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Write Prescription</h3>
            <p className="text-slate-500 mb-6">Add medications to prescribe to this patient. This will appear on their portal.</p>
            
            <div className="space-y-4 mb-6">
              {rxModal.medicines.map((med, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <input type="text" placeholder="Medicine Name" value={med.name} onChange={e => handleRxMedicineChange(idx, 'name', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
                  <input type="text" placeholder="Dosage (e.g. 1-0-1)" value={med.dosage} onChange={e => handleRxMedicineChange(idx, 'dosage', e.target.value)} className="w-32 px-3 py-2 border rounded-lg" />
                  <input type="text" placeholder="Duration (e.g. 5 days)" value={med.duration} onChange={e => handleRxMedicineChange(idx, 'duration', e.target.value)} className="w-32 px-3 py-2 border rounded-lg" />
                  <button onClick={() => setRxModal({...rxModal, medicines: rxModal.medicines.filter((_, i) => i !== idx)})} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={() => setRxModal({...rxModal, medicines: [...rxModal.medicines, { name: '', dosage: '', duration: '' }]})} className="text-blue-600 font-bold flex items-center text-sm">
                <Plus size={16} className="mr-1" /> Add Medicine
              </button>
            </div>

            <textarea 
              value={rxModal.notes} 
              onChange={e => setRxModal({...rxModal, notes: e.target.value})}
              className="w-full h-24 px-4 py-3 border rounded-xl mb-6"
              placeholder="Additional instructions for patient..."
            ></textarea>

            <div className="flex gap-4">
              <button onClick={() => setRxModal({ isOpen: false, appointmentId: null, userId: null, medicines: [{ name: '', dosage: '', duration: '' }], notes: '' })} className="flex-1 px-4 py-3 bg-slate-100 rounded-xl font-bold text-slate-700">Cancel</button>
              <button onClick={handleSavePrescription} className="flex-1 px-4 py-3 bg-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-indigo-200">Send Prescription</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg font-semibold text-white animate-fade-in z-[100] ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      </div>
    </div>
  );
}
