const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  medicines: [{
    name: String,
    dosage: String,
    duration: String
  }],
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
