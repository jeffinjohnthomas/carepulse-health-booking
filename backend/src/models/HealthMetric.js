const mongoose = require('mongoose');

const HealthMetricSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  heartRate: {
    type: Number,
    min: 0,
    max: 300
  },
  bloodSugar: {
    type: Number,
    min: 0,
    max: 1000
  },
  sleepScore: {
    type: Number,
    min: 0,
    max: 100
  }
}, { timestamps: true });

// Ensure a user only has one health metric entry per calendar day
HealthMetricSchema.index({ user: 1, date: 1 }, { unique: false }); // Unique indexing by Day requires special handling, so we will manage this in the controller.

module.exports = mongoose.model('HealthMetric', HealthMetricSchema);
