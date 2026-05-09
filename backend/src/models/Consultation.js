const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.ObjectId, ref: 'Doctor', required: true },
  patientId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  diseaseNotes: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paymentAmount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', ConsultationSchema);
