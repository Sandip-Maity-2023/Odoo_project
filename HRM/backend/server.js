const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// Database initialization
connectDB();

// Core standard middle layers setup
app.use(cors());
app.use(express.json());

// Routes linking mapping points 
app.use('/api/auth', authRoutes);

// Base health check verification link endpoint
app.get('/', (req, res) => res.send('HRM System Backend Core Engine API Online running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server executing active processes on port: ${PORT}`));