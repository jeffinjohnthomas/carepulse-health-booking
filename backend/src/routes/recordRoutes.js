const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { uploadRecord, getRecords, deleteRecord } = require('../controllers/recordController');

// Set up multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post('/upload', protect, upload.single('file'), uploadRecord);
router.get('/', protect, getRecords);
router.delete('/:id', protect, deleteRecord);

module.exports = router;
