require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { startReminderJob } = require('./jobs/reminderJob');

const app = express();

// ----------------------
// CORS Middleware
// ----------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://borrowniex.netlify.app",
  "https://borrownixx.onrender.com"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ----------------------
// Body Parser Middleware
// ----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------
// Routes
// ----------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/borrowers', require('./routes/borrowers'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ----------------------
// MongoDB Connection
// ----------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// ----------------------
// Start Server
// ----------------------
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();

    // Start any scheduled jobs
    startReminderJob();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
