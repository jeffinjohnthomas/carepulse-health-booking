const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  hospitalId: {
    type: String, // OSM Node ID or DB ID
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  consultationType: {
    type: String,
    enum: ['In-Person', 'Online Video Call'],
    required: true,
    default: 'In-Person'
  },
  visitType: {
    type: String,
    enum: ['First Consultation', 'Followup Visit', 'Routine Checkup', 'Emergency'],
    required: true,
    default: 'First Consultation'
  },
  symptoms: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Checked-In', 'In-Progress', 'Completed', 'Cancelled', 'No-Show'],
    default: 'Confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Paid'
  },
  amount: {
    type: Number,
    required: true
  },
  doctorNotes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
