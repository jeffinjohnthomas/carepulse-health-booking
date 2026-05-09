const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
  },
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  pdfUrl: {
    type: String,
    required: [true, 'Please provide the report URL']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
