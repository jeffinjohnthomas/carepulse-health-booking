import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
import TelemedicineRoom from './pages/TelemedicineRoom';
import AITriageBot from './components/AITriageBot';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Services from './pages/Services';
import ProtectedRoute, { AdminRoute, DoctorRoute } from './components/ProtectedRoute';
import AdminDashboard from './pages/Admin/AdminDashboard';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';

// Page Transition Wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/booking" element={<PageWrapper><Booking /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/doctors" element={<ProtectedRoute><PageWrapper><DoctorsList /></PageWrapper></ProtectedRoute>} />
        <Route path="/doctors/:id" element={<ProtectedRoute><PageWrapper><DoctorProfile /></PageWrapper></ProtectedRoute>} />
        <Route path="/hospitals" element={<ProtectedRoute><PageWrapper><HospitalsList /></PageWrapper></ProtectedRoute>} />
        <Route path="/hospitals/:id" element={<ProtectedRoute><PageWrapper><HospitalDetails /></PageWrapper></ProtectedRoute>} />
        <Route path="/appointment-letter" element={<PageWrapper><AppointmentLetter /></PageWrapper>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/telemedicine/:appointmentId" element={<ProtectedRoute><PageWrapper><TelemedicineRoom /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><PageWrapper><AdminDashboard /></PageWrapper></AdminRoute>} />
        <Route path="/doctor/dashboard" element={<DoctorRoute><PageWrapper><DoctorDashboard /></PageWrapper></DoctorRoute>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <Footer />
        <AITriageBot />
      </div>
    </Router>
  );
}

export default App;
