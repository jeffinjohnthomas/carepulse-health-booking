const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true, index: true },
  state: { type: String, required: true },
  zipcode: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [ReviewSchema],
  services: [{ type: String, index: true }],
  departments: [String],
  timings: { type: String, default: 'Open 24/7' },
  contact: {
    phone: String,
    email: String
  },
  isCustom: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Text index for search functionality
HospitalSchema.index({ name: 'text', city: 'text', state: 'text', zipcode: 'text' });

module.exports = mongoose.model('Hospital', HospitalSchema);
