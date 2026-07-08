const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const { securityHeaders } = require('./middleware/securityMiddleware');

dotenv.config();

const app = express();

// Database initialization
connectDB();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Core standard middle layers setup
app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes linking mapping points 
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/profile', require('./routes/profile.routes'));

// Base health check verification link endpoint
app.get('/', (req, res) => res.send('HRM System Backend Core Engine API Online running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server executing active processes on port: ${PORT}`));
