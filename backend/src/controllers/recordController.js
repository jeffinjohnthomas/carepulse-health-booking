const MedicalRecord = require('../models/MedicalRecord');
const path = require('path');

// @desc    Upload a medical record
// @route   POST /api/records/upload
// @access  Private
const uploadRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, type } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const record = await MedicalRecord.create({
      user: req.user._id,
      title,
      type: type || 'Other',
      fileUrl
    });

    res.status(201).json(record);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server Error uploading record' });
  }
};

// @desc    Get user medical records
// @route   GET /api/records
// @access  Private
const getRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ user: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching records' });
  }
};

// @desc    Delete a medical record
// @route   DELETE /api/records/:id
// @access  Private
const deleteRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    
    if (record.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await record.deleteOne();
    res.json({ message: 'Record removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting record' });
  }
};

module.exports = { uploadRecord, getRecords, deleteRecord };
