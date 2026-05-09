import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, CheckCircle, Clock, FileText, LayoutDashboard, User, Check, X, Plus, Trash2, Users, Edit3, FilePlus } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto px-4 py-12 max-w-7xl flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24 text-center">
          {profile?.imageUrl && profile.imageUrl !== 'default-doctor.jpg' ? (
            <img src={profile.imageUrl} alt="Profile" className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-slate-100 mb-4 shadow-sm" />
          ) : (
            <div className="w-24 h-24 mx-auto rounded-full bg-[#0A192F] text-white flex items-center justify-center mb-4 text-3xl font-black shadow-sm">
              {profile?.name?.charAt(0) || user?.name?.charAt(0) || 'D'}
            </div>
          )}
          <h2 className="text-xl font-bold text-slate-900">{profile?.name || user?.name}</h2>
          <p className="text-sm text-slate-500 mb-6">{profile?.specialty || 'General Practitioner'}</p>
          
          <nav className="space-y-1 text-left">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  activeTab === tab.id
                    ? 'bg-[#0A192F] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0A192F]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        
        {/* DASHBOARD OVERVIEW TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-500">Welcome back, {profile?.name || user?.name}. Here is your activity summary.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-slate-50 text-[#0A192F] rounded-2xl flex items-center justify-center mb-4 border border-slate-100"><Calendar size={24} /></div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Total Appointments</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4 border border-orange-100"><Clock size={24} /></div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Upcoming</p>
                <p className="text-3xl font-bold text-slate-900">{stats.upcoming}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 border border-green-100"><CheckCircle size={24} /></div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Completed</p>
                <p className="text-3xl font-bold text-slate-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
            <p className="text-slate-500">View and manage your patient consultations.</p>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                      <th className="p-4 font-medium">Patient</th>
                      <th className="p-4 font-medium">Date & Time</th>
                      <th className="p-4 font-medium">Symptoms</th>
                      <th className="p-4 font-medium">Payment</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {appointments.length === 0 ? (
                      <tr><td colSpan="6" className="p-4 text-center text-slate-500">No appointments found.</td></tr>
                    ) : (
                      appointments.map(a => (
                        <tr key={a._id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-900">{a.user?.name}</td>
                          <td className="p-4 text-slate-600">{new Date(a.date).toLocaleDateString()} at {a.timeSlot}</td>
                          <td className="p-4 text-slate-600 max-w-[150px] truncate" title={a.symptoms}>{a.symptoms}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              a.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {a.paymentStatus} (Read-only)
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              a.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              a.status === 'In-Progress' ? 'bg-indigo-100 text-indigo-700' :
                              a.status === 'Checked-In' ? 'bg-teal-100 text-teal-700' :
                              a.status === 'No-Show' ? 'bg-red-100 text-red-700' :
                              a.status === 'Cancelled' ? 'bg-slate-100 text-slate-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="p-4 space-x-2 flex flex-wrap gap-2">
                            {(a.status === 'Pending' || a.status === 'Confirmed') && (
                              <>
                                <button onClick={() => updateStatus(a._id, 'Checked-In')} className="p-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded text-xs font-semibold" title="Mark Checked-In">Check In</button>
                                <button onClick={() => updateStatus(a._id, 'No-Show')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-semibold" title="Mark No-Show"><X size={14} /></button>
                              </>
                            )}
                            {a.status === 'Checked-In' && (
                              <button onClick={() => updateStatus(a._id, 'In-Progress')} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-xs font-semibold" title="Start Consultation">Start</button>
                            )}
                            {a.status === 'In-Progress' && (
                              <button onClick={() => updateStatus(a._id, 'Completed')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-semibold" title="Mark Completed"><Check size={14} /> Complete</button>
                            )}
                            
                            {(a.status === 'Completed' || a.status === 'In-Progress') && (
                              <>
                                <button onClick={() => setNotesModal({ isOpen: true, appointmentId: a._id, notes: a.doctorNotes || '' })} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded" title="Add Notes"><Edit3 size={16} /></button>
                                <button onClick={() => setRxModal({ isOpen: true, appointmentId: a._id, userId: a.user?._id, medicines: [{ name: '', dosage: '', duration: '' }], notes: '' })} className="p-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded" title="Write Prescription"><FilePlus size={16} /></button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AVAILABILITY TAB */}
        {activeTab === 'availability' && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900">Manage Availability</h1>
            <p className="text-slate-500">Set the dates and time slots patients can book with you.</p>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex gap-4 items-end mb-8">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Select Date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Time Slot (e.g. 09:00 AM)</label>
                  <input type="time" value={newSlot} onChange={e => setNewSlot(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <button onClick={handleAddSlot} className="bg-[#0A192F] text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-slate-800 flex items-center h-[42px] transition-colors">
                  <Plus size={18} className="mr-2" /> Add Slot
                </button>
              </div>

              <h3 className="font-bold text-lg mb-4">Your Current Availability</h3>
              {availabilityForm.length === 0 ? (
                <p className="text-slate-500">No availability set.</p>
              ) : (
                <div className="space-y-4">
                  {availabilityForm.sort((a, b) => new Date(a.date) - new Date(b.date)).map((avail, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-4 md:items-center">
                      <div className="font-semibold text-slate-800 w-32">{new Date(avail.date).toLocaleDateString()}</div>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {avail.slots.map(slot => (
                          <span key={slot} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-sm flex items-center text-slate-700">
                            {slot}
                            <button onClick={() => handleRemoveSlot(avail.date, slot)} className="ml-2 text-red-400 hover:text-red-600"><X size={14} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={saveAvailability} className="mt-8 w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors">
                Save Changes to Live Calendar
              </button>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
            <p className="text-slate-500">Update your public details shown to patients.</p>

            <form onSubmit={handleProfileSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input required type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Specialty</label>
                  <input required type="text" value={profileForm.specialty} onChange={e => setProfileForm({...profileForm, specialty: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})} className="w-full px-4 py-2 border rounded-xl bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Years of Experience</label>
                  <input required type="number" value={profileForm.experience} onChange={e => setProfileForm({...profileForm, experience: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hospital Association (OSM Node ID or Name)</label>
                <input required type="text" value={profileForm.hospital} onChange={e => setProfileForm({...profileForm, hospital: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profile Image URL</label>
                <input type="text" value={profileForm.imageUrl} onChange={e => setProfileForm({...profileForm, imageUrl: e.target.value})} placeholder="https://..." className="w-full px-4 py-2 border rounded-xl" />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4 shadow-md hover:bg-blue-700 transition-colors">
                Save Profile Updates
              </button>
            </form>
          </div>
        )}

        {/* MY PATIENTS TAB */}
        {activeTab === 'patients' && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900">My Patients</h1>
            <p className="text-slate-500">A roster of all patients you have consulted.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patients.length === 0 ? (
                <div className="col-span-full p-6 bg-slate-50 border border-dashed rounded-2xl text-center text-slate-500">No patients yet.</div>
              ) : (
                patients.map(p => (
                  <div key={p.user._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                        {p.user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{p.user.name}</h3>
                        <p className="text-sm text-slate-500">{p.user.email} • {p.user.phone}</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Visits</p>
                        <p className="font-medium text-slate-700">{p.totalVisits}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Last Visit</p>
                        <p className="font-medium text-slate-700">{new Date(p.latestVisit).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

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
