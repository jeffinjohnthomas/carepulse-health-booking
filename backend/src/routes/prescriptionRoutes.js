const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPrescriptions, createPrescription } = require('../controllers/prescriptionController');
const { authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, getPrescriptions);
router.post('/', protect, authorizeRoles('doctor'), createPrescription);

module.exports = router;
