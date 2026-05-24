const HealthMetric = require('../models/HealthMetric');
const User = require('../models/User');

// @desc    Log today's health metrics
// @route   POST /api/health-metrics
// @access  Private
exports.logMetrics = async (req, res) => {
  try {
    const { heartRate, bloodSugar, sleepScore } = req.body;
    
    // Find if an entry already exists for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let metric = await HealthMetric.findOne({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (metric) {
      // Update existing entry for today
      if (heartRate !== undefined) metric.heartRate = heartRate;
      if (bloodSugar !== undefined) metric.bloodSugar = bloodSugar;
      if (sleepScore !== undefined) metric.sleepScore = sleepScore;
      await metric.save();
    } else {
      // Create new entry
      metric = await HealthMetric.create({
        user: req.user.id,
        heartRate,
        bloodSugar,
        sleepScore
      });
    }

    // Also update the User profile with the latest vitals so the OverviewTab cards are up to date
    await User.findByIdAndUpdate(req.user.id, {
      ...(heartRate && { heartRate }),
      ...(bloodSugar && { bloodSugar }),
      ...(sleepScore && { sleepScore })
    });

    res.status(200).json(metric);
  } catch (error) {
    console.error('Log metrics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get health metrics for the last 7 days
// @route   GET /api/health-metrics
// @access  Private
exports.getMetrics = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const metrics = await HealthMetric.find({
      user: req.user.id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 }); // Sort oldest to newest for Recharts

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
