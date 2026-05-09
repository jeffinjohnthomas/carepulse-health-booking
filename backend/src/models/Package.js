const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  testsIncluded: {
    type: [String],
    required: [true, 'Please add tests included in the package']
  },
  imageUrl: {
    type: String,
    default: 'default-package.jpg'
  }
}, { timestamps: true });

module.exports = mongoose.model('Package', PackageSchema);
