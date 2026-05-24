/**
 * GigGuard Server — Entry Point
 * Express + Socket.IO + MongoDB Atlas + node-cron
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { startRiskJob } = require('./jobs/riskJob');

// Routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const riskRoutes = require('./routes/riskRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const testRoutes = require('./routes/testRoutes');
const locationRoutes = require('./routes/locationRoutes');
const vaaniRoutes = require('./routes/vaaniRoutes');

// ─── Connect to MongoDB Atlas ─────────────────────────────────────────────────
connectDB();

// ─── Express App ─────────────────────────────────────────────────────────────
const app = express();

// ─── CORS — allow Vite dev server + port 8080 ────────────────────────────────
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000', 'https://musical-choux-01d41f.netlify.app', 'https://grand-starship-a7388b.netlify.app'],
    credentials: true,
  })
);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/vaani', vaaniRoutes);
// Test routes — WhatsApp debugging (disable in production)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test', testRoutes);
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    message: '🚀 GigGuard server running',
    timestamp: new Date().toISOString(),
  })
);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ─── HTTP server (needed for Socket.IO) ──────────────────────────────────────
const server = http.createServer(app);

// ─── Socket.IO ───────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000', 'https://grand-starship-a7388b.netlify.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Client emits "join" with their userId to enter their private room
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`   👤 Socket ${socket.id} joined room: ${userId}`);
      // Confirm they joined
      socket.emit('joined', { userId, message: 'Connected to GigGuard real-time system' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─── Start INDRA risk cron job (pass io for socket events) ────────────────────
startRiskJob(io);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🛡️  GigGuard API Server — ${process.env.NODE_ENV} mode`);
  console.log(`   🌐 http://localhost:${PORT}/api/health`);
  console.log(`   🔌 Socket.IO ready\n`);
});

// Export io for use in other modules if needed
module.exports = { app, io };
