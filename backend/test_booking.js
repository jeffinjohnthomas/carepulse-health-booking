require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');

mongoose.connect('mongodb://127.0.0.1:27017/healthportal').then(async () => {
  console.log('Connected to DB');
  try {
    const booking = new Booking({
      user: new mongoose.Types.ObjectId(),
      doctor: new mongoose.Types.ObjectId(),
      hospitalId: 'test_id',
      hospitalName: 'test_name',
      date: '2026-05-06',
      timeSlot: '10:00 AM',
      symptoms: 'Fever',
      paymentStatus: 'Paid',
      amount: 50
    });
    const createdBooking = await booking.save();
    console.log('Booking saved successfully');
    
    const Notification = require('./src/models/Notification');
    await Notification.create({
      user: booking.user,
      title: 'Appointment Booked ✅',
      message: `Your appointment is confirmed`,
      type: 'Appointment'
    });
    console.log('Notification saved successfully');
  } catch (error) {
    console.error('Validation Error:', error);
  }
  process.exit();
}).catch(console.error);
