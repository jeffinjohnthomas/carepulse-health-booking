import { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto px-4 py-12 max-w-7xl flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-6 px-4">Admin Control</h2>
            <nav className="space-y-1">
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
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-500">System metrics and high-level statistics.</p>
            
            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 border border-purple-100"><Users size={24} /></div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 border border-blue-100"><Activity size={24} /></div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Doctors</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalDoctors}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4 border border-teal-100"><Calendar size={24} /></div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Bookings</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalBookings}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 border border-green-100"><CreditCard size={24} /></div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Est. Revenue</p>
                  <p className="text-3xl font-bold text-slate-900">₹{stats.revenue.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <p>Loading stats...</p>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-500">Manage all registered accounts, promote users, or revoke access.</p>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Role</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {loading ? (
                      <tr><td colSpan="4" className="p-4 text-center text-slate-500">Loading users...</td></tr>
                    ) : (
                      usersList.map(u => (
                        <tr key={u._id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-900">{u.name}</td>
                          <td className="p-4 text-slate-600">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-teal-100 text-teal-700' : u.role === 'doctor' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 space-x-2 flex items-center">
                            {u.role === 'patient' && (
                              <>
                                <button onClick={() => setShowPromoteModal({ show: true, userId: u._id })} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold hover:bg-blue-100 transition-colors">Make Doctor</button>
                                <button onClick={() => promoteToAdmin(u._id)} className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-md text-xs font-semibold hover:bg-teal-100 transition-colors">Make Admin</button>
                              </>
                            )}
                            {u._id !== user._id && (
                              <button onClick={() => deleteEntity(u._id, 'user')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete User">
                                <Trash2 size={16} />
                              </button>
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

        {/* DOCTORS TAB */}
        {activeTab === 'doctors' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Doctor Profiles</h1>
                <p className="text-slate-500">Add custom doctor profiles so they can be linked to user accounts.</p>
              </div>
              <button 
                onClick={() => setShowDoctorModal(true)}
                className="bg-[#0A192F] text-white px-6 py-2.5 rounded-xl font-bold shadow hover:bg-slate-800 transition-colors"
              >
                + Add Doctor Profile
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Specialty</th>
                      <th className="p-4 font-medium">Experience</th>
                      <th className="p-4 font-medium">Fee</th>
                      <th className="p-4 font-medium">Profile ID (Copy this)</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {doctors.length === 0 ? (
                      <tr><td colSpan="5" className="p-4 text-center text-slate-500">No doctors added yet.</td></tr>
                    ) : (
                      doctors.map(d => (
                        <tr key={d._id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-900">{d.name}</td>
                          <td className="p-4 text-slate-600">{d.specialty}</td>
                          <td className="p-4 text-slate-600">{d.experience} years</td>
                          <td className="p-4 text-slate-600">₹{d.consultationFee}</td>
                          <td className="p-4 text-slate-500 font-mono text-xs select-all bg-slate-100 px-2 py-1 rounded inline-block mt-2 ml-4">{d._id}</td>
                          <td className="p-4">
                            <button onClick={() => deleteEntity(d._id, 'doctor')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete Doctor">
                              <Trash2 size={16} />
                            </button>
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

        {/* HOSPITALS TAB */}
        {activeTab === 'hospitals' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Hospital Management</h1>
                <p className="text-slate-500">Create custom hospitals bypassing OpenStreetMap discovery.</p>
              </div>
              <button 
                onClick={() => setShowHospitalModal(true)}
                className="bg-[#0A192F] text-white px-6 py-2.5 rounded-xl font-bold shadow hover:bg-slate-800 transition-colors"
              >
                + Add Custom Hospital
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                      <th className="p-4 font-medium">Hospital Name</th>
                      <th className="p-4 font-medium">City</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {hospitals.length === 0 ? (
                      <tr><td colSpan="3" className="p-4 text-center text-slate-500">No custom hospitals added yet.</td></tr>
                    ) : (
                      hospitals.map(h => (
                        <tr key={h._id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-900">{h.name}</td>
                          <td className="p-4 text-slate-600">{h.city}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Custom Entry</span>
                          </td>
                          <td className="p-4">
                            <button onClick={() => deleteEntity(h._id, 'hospital')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete Hospital">
                              <Trash2 size={16} />
                            </button>
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

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900">Appointments & Payments</h1>
            <p className="text-slate-500">Master ledger for all system transactions and bookings.</p>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                      <th className="p-4 font-medium">Patient</th>
                      <th className="p-4 font-medium">Doctor</th>
                      <th className="p-4 font-medium">Date & Time</th>
                      <th className="p-4 font-medium">Payment</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {appointments.length === 0 ? (
                      <tr><td colSpan="5" className="p-4 text-center text-slate-500">No appointments recorded yet.</td></tr>
                    ) : (
                      appointments.map(a => (
                        <tr key={a._id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-900">{a.user?.name}</td>
                          <td className="p-4 text-slate-600">{a.doctor?.name || 'N/A'}</td>
                          <td className="p-4 text-slate-600">{new Date(a.date).toLocaleDateString()} {a.timeSlot}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              a.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {a.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-blue-600">{a.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>

      {/* --- MODALS --- */}

      {/* Hospital Modal */}
      {showHospitalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Custom Hospital</h3>
              <button onClick={() => setShowHospitalModal(false)}><X size={20} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleAddHospital} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hospital Name</label>
                <input required type="text" value={hospitalForm.name} onChange={e => setHospitalForm({...hospitalForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input required type="text" value={hospitalForm.city} onChange={e => setHospitalForm({...hospitalForm, city: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Full Address</label>
                <input required type="text" value={hospitalForm.address} onChange={e => setHospitalForm({...hospitalForm, address: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium mt-4">Save Hospital</button>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create Doctor Profile</h3>
              <button onClick={() => setShowDoctorModal(false)}><X size={20} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Doctor Name (e.g., Dr. Smith)</label>
                <input required type="text" value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Specialty</label>
                  <input required type="text" value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Experience (Yrs)</label>
                  <input required type="number" value={doctorForm.experience} onChange={e => setDoctorForm({...doctorForm, experience: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select value={doctorForm.gender} onChange={e => setDoctorForm({...doctorForm, gender: e.target.value})} className="w-full px-4 py-2 border rounded-xl bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Consultation Fee (₹)</label>
                  <input required type="number" value={doctorForm.consultationFee} onChange={e => setDoctorForm({...doctorForm, consultationFee: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hospital (Name or ID)</label>
                <input required type="text" value={doctorForm.hospital} onChange={e => setDoctorForm({...doctorForm, hospital: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium mt-4">Save Doctor Profile</button>
            </form>
          </div>
        </div>
      )}

      {/* Promote Modal */}
      {showPromoteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Link Doctor Profile</h3>
              <button onClick={() => setShowPromoteModal({ show: false, userId: null })}><X size={20} className="text-slate-500" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">To promote this user to a Doctor, you must link them to an existing Doctor Profile ID.</p>
            <form onSubmit={handlePromoteToDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Doctor Profile ID</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Paste ID from the Doctors tab..."
                  value={promoteForm.doctorId} 
                  onChange={e => setPromoteForm({ doctorId: e.target.value })} 
                  className="w-full px-4 py-2 border rounded-xl font-mono text-sm" 
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium mt-4">Promote to Doctor</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 capitalize">Delete {showDeleteModal.entityType}?</h3>
            <p className="text-slate-500 mb-6">Are you sure you want to permanently remove this {showDeleteModal.entityType} from the system? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal({ show: false, entityId: null, entityType: null })}
                className="flex-1 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
