const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { 
  getAllUsers, 
  promoteToDoctor, 
  promoteToAdmin, 
  getAllBookings, 
  getSystemStats, 
  deleteUser,
  addHospital,
  getCustomHospitals,
  createDoctor,
  getDoctors,
  deleteHospital,
  deleteDoctor
} = require('../controllers/adminController');

const router = express.Router();

// All routes here are protected and require 'admin' role
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/promote-doctor', promoteToDoctor);
router.put('/users/:id/promote-admin', promoteToAdmin);
router.get('/bookings', getAllBookings);
router.post('/hospitals', addHospital);
router.get('/hospitals', getCustomHospitals);
router.delete('/hospitals/:id', deleteHospital);
router.post('/doctors', createDoctor);
router.get('/doctors', getDoctors);
router.delete('/doctors/:id', deleteDoctor);

module.exports = router;
