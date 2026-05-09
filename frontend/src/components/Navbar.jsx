import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, User, LogOut, LayoutDashboard, ChevronDown, Bell, CheckCircle, Menu, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import api from '../services/api';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setShowDropdown(false);
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-[0_4px_12px_rgb(37,99,235,0.3)]">
            <HeartPulse size={24} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-blue-600 tracking-tight">CarePulse</span>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-slate-600 hover:text-blue-600 transition-colors font-bold text-sm">Home</Link>
          <Link to="/hospitals" className="text-slate-600 hover:text-blue-600 transition-colors font-bold text-sm">Hospitals</Link>
          <Link to="/doctors" className="text-slate-600 hover:text-blue-600 transition-colors font-bold text-sm">Doctors</Link>
          <Link to="/services" className="text-slate-600 hover:text-blue-600 transition-colors font-bold text-sm">Services</Link>
          <Link to="/about" className="text-slate-600 hover:text-blue-600 transition-colors font-bold text-sm">About Us</Link>
          
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-slate-800">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-slate-500 text-sm">No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n._id} 
                            onClick={() => !n.isRead && markAsRead(n._id)}
                            className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-sm text-slate-800">{n.title}</span>
                              {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1"></span>}
                            </div>
                            <p className="text-xs text-slate-600">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <User size={18} />
                  </div>
                  <span className="text-slate-700 font-medium hidden sm:inline">{user?.name?.split(' ')[0] || 'User'}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">
                    <Link 
                      to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'} 
                      className="flex items-center space-x-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <LayoutDashboard size={18} />
                      <span>{user?.role === 'admin' ? 'Admin Panel' : user?.role === 'doctor' ? 'Doctor Panel' : 'Dashboard'}</span>
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg transition-all">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center space-x-4">
          {isAuthenticated && (
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>
              {/* Notification Dropdown logic duplicated for mobile or kept generic */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-slate-500 text-sm">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} onClick={() => !n.isRead && markAsRead(n._id)} className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm text-slate-800">{n.title}</span>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1"></span>}
                          </div>
                          <p className="text-xs text-slate-600">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-blue-600"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-lg py-4 px-4 flex flex-col space-y-4">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium py-2">Home</Link>
          <Link to="/hospitals" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium py-2">Hospitals</Link>
          <Link to="/doctors" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium py-2">Doctors</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium py-2">About Us</Link>
          <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium py-2">Services</Link>
          <hr className="border-slate-100" />
          {isAuthenticated ? (
            <>
              <Link to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'} onClick={() => setIsMobileMenuOpen(false)} className="text-blue-600 font-medium py-2 flex items-center space-x-2">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-red-500 font-medium py-2 flex items-center space-x-2 w-full text-left">
                <LogOut size={18} />
                <span>Logout ({user?.name?.split(' ')[0]})</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-3 pt-2">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center text-slate-600 font-medium py-2 border border-slate-200 rounded-xl">Sign In</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-blue-600 text-white font-medium py-2 rounded-xl">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
