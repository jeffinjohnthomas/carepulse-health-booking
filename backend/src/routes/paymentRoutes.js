const express = require('express');
const router = express.Router();
const { createOrder, verifySignature, getRazorpayKey } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifySignature);
router.get('/get-key', protect, getRazorpayKey);

module.exports = router;
