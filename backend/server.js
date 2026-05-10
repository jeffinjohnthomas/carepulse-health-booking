const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database (deferred until start)

const app = express();

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

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to Database. Server not started.", err);
});
