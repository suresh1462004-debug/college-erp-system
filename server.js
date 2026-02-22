const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', async (req, res, next) => {
  try {
    const connectDB = require('./config/db');
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      detail: error.message
    });
  }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
    jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
  });
});

app.get('/api/debug', async (req, res) => {
  try {
    const connectDB = require('./config/db');
    await connectDB();
    const mongoose = require('mongoose');
    res.json({
      success: true,
      message: 'MongoDB connected!',
      host: mongoose.connection.host,
      db: mongoose.connection.name
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      mongoUri: process.env.MONGODB_URI ?
        process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@') :
        'MONGODB_URI NOT SET'
    });
  }
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ success: false, message: 'API route not found' });
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}

module.exports = app;

