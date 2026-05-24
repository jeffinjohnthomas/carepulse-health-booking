const express = require('express');
const { logMetrics, getMetrics } = require('../controllers/healthMetricController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, logMetrics)
  .get(protect, getMetrics);

module.exports = router;
