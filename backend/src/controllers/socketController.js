const Message = require('../models/Message');
const mongoose = require('mongoose');

const initSockets = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id);

    socket.on('join-personal-room', (userId) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined personal room ${userId}`);
    });

    socket.on('ring-room', async (data) => {
      const { roomId, callerId, callerName } = data;
      try {
        const Booking = mongoose.model('Booking');
        const Doctor = mongoose.model('Doctor');
        
        const booking = await Booking.findById(roomId).populate('doctor');
        if (!booking) return;

        // Determine target userId
        let targetUserId;
        if (booking.user.toString() === callerId) {
          // Caller is patient, ring doctor
          const doctor = await Doctor.findById(booking.doctor._id);
          targetUserId = doctor.user.toString();
        } else {
          // Caller is doctor, ring patient
          targetUserId = booking.user.toString();
        }

        socket.to(targetUserId).emit('incoming-call', {
          roomId,
          callerName
        });
      } catch (err) {
        console.error('Failed to ring room:', err);
      }
    });

    socket.on('join-room', async (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      
      // Fetch and send chat history for this room
      try {
        const history = await Message.find({ appointmentId: roomId })
          .sort({ timestamp: 1 })
          .populate('sender', 'name role')
          .limit(100);
        socket.emit('chat-history', history);
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    });

    socket.on('send-message', async (data) => {
      const { roomId, senderId, text } = data;
      
      try {
        const newMessage = new Message({
          appointmentId: roomId,
          sender: senderId,
          text: text
        });
        await newMessage.save();
        
        // Populate sender info before broadcasting
        await newMessage.populate('sender', 'name role');
        
        io.to(roomId).emit('receive-message', newMessage);
      } catch (err) {
        console.error('Failed to save message:', err);
      }
    });

    // WebRTC Signaling
    socket.on('video-offer', (data) => {
      socket.to(data.roomId).emit('video-offer', data);
    });

    socket.on('video-answer', (data) => {
      socket.to(data.roomId).emit('video-answer', data);
    });

    socket.on('ice-candidate', (data) => {
      socket.to(data.roomId).emit('ice-candidate', data);
    });
    
    socket.on('end-call', (roomId) => {
      socket.to(roomId).emit('call-ended');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = initSockets;
