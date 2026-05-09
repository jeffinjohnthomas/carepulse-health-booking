import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DoctorsList from './pages/Doctors';
import DoctorProfile from './pages/Doctors/DoctorProfile';
import HospitalsList from './pages/Hospitals';
import HospitalDetails from './pages/Hospitals/HospitalDetails';
import AppointmentLetter from './components/AppointmentLetter';
import Chatbot from './components/Chatbot';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Services from './pages/Services';
import ProtectedRoute, { AdminRoute, DoctorRoute } from './components/ProtectedRoute';
import AdminDashboard from './pages/Admin/AdminDashboard';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<ProtectedRoute><DoctorsList /></ProtectedRoute>} />
            <Route path="/doctors/:id" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
            <Route path="/hospitals" element={<ProtectedRoute><HospitalsList /></ProtectedRoute>} />
            <Route path="/hospitals/:id" element={<ProtectedRoute><HospitalDetails /></ProtectedRoute>} />
            <Route path="/appointment-letter" element={<AppointmentLetter />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/doctor/dashboard" element={<DoctorRoute><DoctorDashboard /></DoctorRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
          </Routes>
        </main>
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
