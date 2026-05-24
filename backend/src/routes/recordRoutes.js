const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/authMiddleware');
const { uploadRecord, getRecords, deleteRecord } = require('../controllers/recordController');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'carepulse/records',
    resource_type: 'raw'
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error("Multer Error:", err);
      return res.status(400).json({ message: `Multer Error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error("Unknown Upload Error:", err);
      return res.status(500).json({ message: `Upload Error: ${err.message}` });
    }
    // Everything went fine.
    next();
  });
};

router.post('/upload', protect, uploadMiddleware, uploadRecord);
router.get('/', protect, getRecords);
router.delete('/:id', protect, deleteRecord);

module.exports = router;
