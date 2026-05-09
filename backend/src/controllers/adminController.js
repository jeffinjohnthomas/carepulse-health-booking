const User = require('../models/User');
const Booking = require('../models/Booking');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const bookings = await Booking.find({});
    const totalBookings = bookings.length;
    
    // Calculate total revenue (assuming price is stored or derived)
    // For this example we just count paid bookings
    const paidBookings = bookings.filter(b => b.paymentStatus === 'Paid');
    const revenue = paidBookings.reduce((sum, b) => sum + (b.amount || 500), 0); // Mock 500 per booking if amount not in schema

    res.json({
      totalUsers,
      totalDoctors,
      totalAdmins,
      totalBookings,
      revenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// @desc    Promote a user to Admin
// @route   PUT /api/admin/users/:id/promote-admin
// @access  Private/Admin
const promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = 'admin';
    await user.save();
    res.json({ message: 'User promoted to admin successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error promoting user' });
  }
};

// @desc    Promote a user to Doctor
// @route   PUT /api/admin/users/:id/promote-doctor
// @access  Private/Admin
const promoteToDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required to link profile' });
    }

    const doctorProfile = await Doctor.findById(doctorId);
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = 'doctor';
    user.doctorId = doctorId;
    await user.save();

    doctorProfile.user = user._id;
    await doctorProfile.save();

    res.json({ message: 'User promoted to doctor successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error promoting user to doctor' });
  }
};

// @desc    Get all bookings in the system
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('doctor', 'name specialty')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

// @desc    Add a custom hospital
// @route   POST /api/admin/hospitals
// @access  Private/Admin
const addHospital = async (req, res) => {
  try {
    const hospital = new Hospital({
      ...req.body,
      image: req.body.image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=600',
      isCustom: true
    });
    const createdHospital = await hospital.save();
    res.status(201).json(createdHospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding hospital' });
  }
};

// @desc    Get custom hospitals
// @route   GET /api/admin/hospitals
// @access  Private/Admin
const getCustomHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isCustom: true }).sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospitals' });
  }
};

// @desc    Create a public doctor profile
// @route   POST /api/admin/doctors
// @access  Private/Admin
const createDoctor = async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    const createdDoctor = await doctor.save();
    res.status(201).json(createdDoctor);
  } catch (error) {
    res.status(500).json({ message: 'Error creating doctor profile' });
  }
};

// @desc    Get all doctor profiles
// @route   GET /api/admin/doctors
// @access  Private/Admin
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
};

// @desc    Delete a custom hospital
// @route   DELETE /api/admin/hospitals/:id
// @access  Private/Admin
const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    await Hospital.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hospital removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting hospital' });
  }
};

// @desc    Delete a custom doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private/Admin
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor' });
  }
};

module.exports = {
  getAllUsers,
  promoteToAdmin,
  promoteToDoctor,
  getAllBookings,
  getSystemStats,
  deleteUser,
  addHospital,
  getCustomHospitals,
  createDoctor,
  getDoctors,
  deleteHospital,
  deleteDoctor
};
