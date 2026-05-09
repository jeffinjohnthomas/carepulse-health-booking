const Prescription = require('../models/Prescription');

// @desc    Get user prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id })
      .populate('doctor', 'name specialty')
      .populate('booking', 'date timeSlot')
      .sort({ date: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching prescriptions' });
  }
};

// @desc    Create a prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
const createPrescription = async (req, res) => {
  try {
    const { userId, bookingId, medicines, notes } = req.body;
    
    if (!req.user.doctorId) {
      return res.status(403).json({ message: 'Only doctors can write prescriptions' });
    }

    const Booking = require('../models/Booking');
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.doctor.toString() !== req.user.doctorId.toString()) {
      return res.status(403).json({ message: 'Not authorized to write prescription for this appointment' });
    }

    const prescription = new Prescription({
      user: userId,
      doctor: req.user.doctorId,
      booking: bookingId,
      medicines,
      notes
    });

    await prescription.save();

    const Notification = require('../models/Notification');
    await Notification.create({
      user: userId,
      title: 'New Prescription Added',
      message: `A new prescription has been added by your doctor.`,
      type: 'prescription'
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating prescription' });
  }
};

module.exports = { getPrescriptions, createPrescription };
