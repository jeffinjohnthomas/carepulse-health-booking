import { useState } from 'react';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/authSlice';
import api from '../../services/api';

export default function SettingsTab({ user }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    heartRate: user?.heartRate || '',
    bloodSugar: user?.bloodSugar || '',
    sleepScore: user?.sleepScore || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      const { data } = await api.put('/auth/profile', formData);
      dispatch(setCredentials(data));
      setMessage('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden max-w-3xl mx-auto">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-xl mr-4">
          <User size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Profile Settings</h2>
          <p className="text-slate-500 text-sm">Update your personal information and security</p>
        </div>
      </div>
      
      <div className="p-6 md:p-8">
        {message && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium border border-green-100">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange} required 
                  className="w-full pl-10 p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} required 
                  className="w-full pl-10 p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="tel" name="phone" value={formData.phone} onChange={handleChange} required 
                className="w-full pl-10 p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
              />
            </div>
          </div>



          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
