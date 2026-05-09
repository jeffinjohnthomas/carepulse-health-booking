const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['Lab Report', 'X-Ray', 'Prescription', 'Other'],
    default: 'Other'
  }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
