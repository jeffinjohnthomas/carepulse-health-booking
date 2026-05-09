const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: Number, required: true }, // years
  consultationFee: { type: Number, required: true },
  about: { type: String },
  hospital: { 
    type: mongoose.Schema.Types.Mixed, // Storing OSM Node ID or Hospital ID
    ref: 'Hospital',
    required: true
  },
  hospitalName: {
    type: String,
    required: true,
    default: 'General Hospital'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  insuranceAccepted: [{ type: String }],
  symptomsTreated: [{ type: String, index: true }],
  availability: [{
    date: String, // YYYY-MM-DD
    slots: [String] // e.g. "09:00 AM"
  }],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  imageUrl: { type: String, default: 'default-doctor.jpg' }
}, { timestamps: true });

// Text index for search functionality
DoctorSchema.index({ name: 'text', specialty: 'text', symptomsTreated: 'text' });

module.exports = mongoose.model('Doctor', DoctorSchema);
