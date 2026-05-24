const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const crypto = require('crypto');

// @desc    Create new booking (Requires Razorpay payment verification)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { doctorId, hospitalId, hospitalName, date, timeSlot, consultationType, visitType, symptoms, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!doctorId || !hospitalId || !hospitalName || !date || !timeSlot || !consultationType || !visitType || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Please provide all required fields including payment details' });
    }

    // Verify Payment Signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Cannot create appointment.' });
    }

    const booking = new Booking({
      user: req.user._id,
      doctor: doctorId,
      hospitalId,
      hospitalName,
      date,
      timeSlot,
      consultationType,
      visitType,
      symptoms,
      paymentStatus: 'Paid',
      amount: 50 // Fixed Token Amount
    });

    const createdBooking = await booking.save();

    // Create Notification
    await Notification.create({
      user: req.user._id,
      title: 'Appointment Booked ✅',
      message: `Your appointment is confirmed for ${new Date(date).toLocaleDateString()} at ${timeSlot}.`,
      type: 'Appointment'
    });

    res.status(201).json(createdBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: error.message || 'Server Error creating booking' });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('doctor', 'name specialty imageUrl')
      .sort({ createdAt: -1 });
      
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching bookings' });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'Cancelled' || booking.status === 'Completed' || booking.status === 'No-Show') {
      return res.status(400).json({ message: `Booking cannot be cancelled because it is ${booking.status}` });
    }

    booking.status = 'Cancelled';
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking' });
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking };
