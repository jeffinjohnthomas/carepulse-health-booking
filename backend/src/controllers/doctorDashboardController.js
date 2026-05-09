const Booking = require('../models/Booking');
const Doctor = require('../models/Doctor');

// @desc    Get logged in doctor's profile
// @route   GET /api/doctor-dashboard/profile
// @access  Private/Doctor
const getDoctorProfile = async (req, res) => {
  try {
    if (!req.user.doctorId) {
      return res.json({ name: req.user.name, isNewDoctor: true });
    }
    const doctor = await Doctor.findById(req.user.doctorId);
    if (!doctor) {
      return res.json({ name: req.user.name, isNewDoctor: true });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor profile' });
  }
};

// @desc    Get appointments for the logged in doctor
// @route   GET /api/doctor-dashboard/appointments
// @access  Private/Doctor
const getDoctorAppointments = async (req, res) => {
  try {
    if (!req.user.doctorId) {
      return res.json([]);
    }
    
    const bookings = await Booking.find({ doctor: req.user.doctorId })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
      
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

// @desc    Update appointment status
// @route   PUT /api/doctor-dashboard/appointments/:id/status
// @access  Private/Doctor
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Security check: Only the assigned doctor can update it
    if (booking.doctor.toString() !== req.user.doctorId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }
    
    booking.status = status;
    await booking.save();
    
    if (status === 'Completed') {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: booking.user,
        title: 'Consultation Completed',
        message: `Your consultation on ${booking.date} has been marked as completed.`,
        type: 'appointment'
      });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment status' });
  }
};

// @desc    Update doctor notes on appointment
// @route   PUT /api/doctor-dashboard/appointments/:id/notes
// @access  Private/Doctor
const updateDoctorNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (booking.doctor.toString() !== req.user.doctorId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }
    
    booking.doctorNotes = notes;
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notes' });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctor-dashboard/profile
// @access  Private/Doctor
const updateDoctorProfile = async (req, res) => {
  try {
    const User = require('../models/User'); // Import here to avoid circular dependency issues
    let doctor;
    
    if (req.user.doctorId) {
      doctor = await Doctor.findById(req.user.doctorId);
    }
    
    if (!doctor) {
      // Create new doctor document
      doctor = new Doctor({
        name: req.body.name || req.user.name,
        specialty: req.body.specialty || 'General Practitioner',
        experience: req.body.experience || 0,
        hospital: req.body.hospital || 'Unknown',
        hospitalName: req.body.hospitalName || req.body.hospital || 'Unknown Hospital',
        imageUrl: req.body.imageUrl || 'default-doctor.jpg',
        gender: req.body.gender || 'Other',
        availability: [],
        rating: 5.0,
        fee: 500,
        about: 'Experienced professional.',
        insuranceAccepted: ['All']
      });
      await doctor.save();
      
      // Link to User
      const user = await User.findById(req.user._id);
      user.doctorId = doctor._id;
      await user.save();
      
      // Update req.user for this request
      req.user.doctorId = doctor._id;
    } else {
      doctor.name = req.body.name || doctor.name;
      doctor.specialty = req.body.specialty || doctor.specialty;
      doctor.experience = req.body.experience || doctor.experience;
      doctor.hospital = req.body.hospital || doctor.hospital;
      doctor.hospitalName = req.body.hospitalName || req.body.hospital || doctor.hospitalName;
      doctor.imageUrl = req.body.imageUrl || doctor.imageUrl;
      doctor.gender = req.body.gender || doctor.gender;

      if (req.body.hospitalName) doctor.hospitalName = req.body.hospitalName;
      else if (req.body.hospital) doctor.hospitalName = req.body.hospital; // Fallback
      if (req.body.imageUrl) doctor.imageUrl = req.body.imageUrl;
      await doctor.save();
    }

    res.json(doctor);
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// @desc    Update availability
// @route   PUT /api/doctor-dashboard/availability
// @access  Private/Doctor
const updateAvailability = async (req, res) => {
  try {
    if (!req.user.doctorId) return res.status(404).json({ message: 'Please complete your profile settings first' });
    const doctor = await Doctor.findById(req.user.doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Expecting req.body.availability to be an array: [{ date: 'YYYY-MM-DD', slots: ['09:00 AM'] }]
    if (Array.isArray(req.body.availability)) {
      doctor.availability = req.body.availability;
      const updatedDoctor = await doctor.save();
      return res.json(updatedDoctor);
    }
    
    res.status(400).json({ message: 'Invalid availability format' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/doctor-dashboard/stats
// @access  Private/Doctor
const getDoctorStats = async (req, res) => {
  try {
    if (!req.user.doctorId) {
      return res.json({ total: 0, upcoming: 0, completed: 0 });
    }
    const appointments = await Booking.find({ doctor: req.user.doctorId });
    
    const total = appointments.length;
    const upcoming = appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed').length;
    const completed = appointments.filter(a => a.status === 'Completed').length;
    
    res.json({ total, upcoming, completed });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// @desc    Get patients for the logged in doctor
// @route   GET /api/doctor-dashboard/patients
// @access  Private/Doctor
const getDoctorPatients = async (req, res) => {
  try {
    if (!req.user.doctorId) {
      return res.json([]);
    }
    const bookings = await Booking.find({ doctor: req.user.doctorId })
      .populate('user', 'name email phone')
      .sort({ date: -1 });

    const patientsMap = {};
    
    bookings.forEach(booking => {
      if (!booking.user) return; // skip if user deleted
      const userId = booking.user._id.toString();
      
      if (!patientsMap[userId]) {
        patientsMap[userId] = {
          user: booking.user,
          totalVisits: 0,
          history: [],
          latestVisit: booking.date,
          nextVisit: null
        };
      }
      
      patientsMap[userId].totalVisits += 1;
      patientsMap[userId].history.push({
        _id: booking._id,
        date: booking.date,
        symptoms: booking.symptoms,
        status: booking.status
      });

      // Update nextVisit if date is in future
      if (new Date(booking.date) >= new Date() && booking.status !== 'Cancelled') {
        if (!patientsMap[userId].nextVisit || new Date(booking.date) < new Date(patientsMap[userId].nextVisit)) {
          patientsMap[userId].nextVisit = booking.date;
        }
      }
    });

    const patientsList = Object.values(patientsMap);
    res.json(patientsList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
};

module.exports = {
  getDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
  updateDoctorNotes,
  updateDoctorProfile,
  updateAvailability,
  getDoctorStats,
  getDoctorPatients
};
