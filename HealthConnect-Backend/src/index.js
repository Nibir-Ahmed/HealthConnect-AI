require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize, testConnection } = require('./config/database');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');
const recordRoutes = require('./routes/recordRoutes');
const blogRoutes = require('./routes/blogRoutes');
const adminRoutes = require('./routes/adminRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HealthConnect Backend API' });
});

// Database Connection & Sync
const ensureMasterAdmin = async () => {
  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('123456', 10);
    let admin = await User.findOne({ where: { email: 'admin@healthconnect.com' } });
    if (!admin) {
      admin = await User.create({
        name: 'Master Admin',
        email: 'admin@healthconnect.com',
        password: hashedPassword,
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Master+Admin&background=00A896&color=fff'
      });
      console.log('✅ Master Admin account created: admin@healthconnect.com / 123456');
    } else {
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
      console.log('✅ Master Admin credentials updated: admin@healthconnect.com / 123456');
    }
  } catch (err) {
    console.error('Error ensuring master admin account:', err.message);
  }
};

testConnection();
if (process.env.SKIP_DB_SYNC === 'true') {
  console.log('ℹ️ SKIP_DB_SYNC=true — skipping sequelize.sync() at startup.');
  ensureMasterAdmin();
} else {
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('✅ Database models synced successfully.');
      ensureMasterAdmin();
    })
    .catch(err => console.error('❌ Failed to sync models:', err));
}

// Socket.io for Real-time Chat
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('user_connected', async (userId) => {
    socket.userId = userId;
    if (userId) {
      await User.update({ isOnline: true }, { where: { id: userId } });
      io.emit('user_status_change', { userId, isOnline: true });
    }
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    socket.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.id}`);
    if (socket.userId) {
      await User.update({ isOnline: false }, { where: { id: socket.userId } });
      io.emit('user_status_change', { userId: socket.userId, isOnline: false });
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
