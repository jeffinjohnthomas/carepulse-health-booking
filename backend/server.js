const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database (deferred until start)

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Pass io to request object if needed in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Initialize Socket Controller
const initSockets = require('./src/controllers/socketController');
initSockets(io);

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Expose uploads directory statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const authRoutes = require('./src/routes/authRoutes');
const packageRoutes = require('./src/routes/packageRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const hospitalRoutes = require('./src/routes/hospitalRoutes');
const consultationRoutes = require('./src/routes/consultationRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const doctorDashboardRoutes = require('./src/routes/doctorDashboardRoutes');
const recordRoutes = require('./src/routes/recordRoutes');
const prescriptionRoutes = require('./src/routes/prescriptionRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const healthMetricRoutes = require('./src/routes/healthMetricRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor-dashboard', doctorDashboardRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/health-metrics', healthMetricRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Global error handler for debugging
app.use((err, req, res, next) => {
  console.error("Global Error Handler caught:", err.message, err.stack, err);
  res.status(500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to Database. Server not started.", err);
});
