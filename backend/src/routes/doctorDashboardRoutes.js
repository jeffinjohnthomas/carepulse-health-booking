const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { 
  getDoctorAppointments, 
  updateAppointmentStatus, 
  getDoctorProfile, 
  updateDoctorNotes,
  updateDoctorProfile,
  updateAvailability,
  getDoctorStats,
  getDoctorPatients
} = require('../controllers/doctorDashboardController');

const router = express.Router();

// All routes here require 'doctor' role
router.use(protect);
router.use(authorizeRoles('doctor'));

router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);
router.put('/availability', updateAvailability);
router.get('/stats', getDoctorStats);
router.get('/appointments', getDoctorAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.put('/appointments/:id/notes', updateDoctorNotes);
router.get('/patients', getDoctorPatients);

module.exports = router;
