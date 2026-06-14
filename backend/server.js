require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const { Message } = require('./config/db');
const { checkSymptoms } = require('./services/aiSymptomChecker');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reportRoutes = require('./routes/reportRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy for rate limiting behind reverse proxies (Nginx, Render, Railway, etc.)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Enable Cross-Origin Resource Sharing
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['*'];

app.use(cors({
  origin: isProduction ? allowedOrigins : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Enable gzip compression for all responses
app.use(compression());

// Configure middleware with payload size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Cache-Control for GET API requests
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'private, max-age=5, stale-while-revalidate=10');
  }
  next();
});

// Serve patient reports statically from public/uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);

// AI Symptom Checker Route
app.post('/api/ai/symptom-checker', (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms) {
    return res.status(400).json({ message: 'Please provide symptoms description text.' });
  }
  const suggestion = checkSymptoms(symptoms);
  res.json(suggestion);
});

// Server status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: 'JSON Mock DB Online',
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);

// Bind Socket.io for real-time messaging and WebRTC signaling
const io = new Server(server, {
  cors: {
    origin: isProduction ? allowedOrigins : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // User registers their active user ID to join a private room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`[Socket] ${socket.id} joined room: ${userId}`);
  });

  // ── Chat Messages ─────────────────────────────────────────────────────
  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, message } = data;
    if (!senderId || !receiverId || !message) return;

    try {
      const msg = await Message.create({
        senderId,
        receiverId,
        message,
        timestamp: new Date().toISOString()
      });
      io.to(receiverId).to(senderId).emit('messageReceived', msg);
    } catch (error) {
      console.error('[Socket] Message save failed:', error);
    }
  });

  // ── WebRTC Call Signaling ─────────────────────────────────────────────

  // Caller initiates — relay offer to callee
  socket.on('callUser', (data) => {
    const { userToCall, signalData, from, callerName } = data;
    console.log(`[Call] ${callerName} (${from}) → calling → ${userToCall}`);
    io.to(userToCall).emit('incomingCall', {
      signal: signalData,
      from,
      callerName
    });
  });

  // Callee accepts — relay answer back to caller
  socket.on('answerCall', (data) => {
    const { to, signal } = data;
    console.log(`[Call] Answer sent → ${to}`);
    io.to(to).emit('callAccepted', { signal });
  });

  // Callee rejects — notify caller
  socket.on('rejectCall', (data) => {
    const { to, reason } = data;
    console.log(`[Call] Call rejected → ${to}, reason: ${reason}`);
    io.to(to).emit('callRejected', { reason });
  });

  // Either party ends the call
  socket.on('endCall', (data) => {
    const { to } = data;
    console.log(`[Call] Call ended → ${to}`);
    io.to(to).emit('callEnded');
  });

  // ICE candidate exchange — critical for NAT traversal
  socket.on('iceCandidate', (data) => {
    const { to, candidate } = data;
    console.log(`[Call] ICE candidate → ${to}`);
    io.to(to).emit('iceCandidate', { candidate });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Telemedicine Full-Stack Server running on port ${PORT}`);
});
