const express = require('express');
const router = express.Router();
const { triageSymptom, parseMedicalRecord } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/temp/' });

router.post('/triage', protect, triageSymptom);
router.post('/parse-record', protect, upload.single('file'), parseMedicalRecord);

module.exports = router;
