const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify token authenticity interceptor
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token provided.' });
};

// Access gating role check engine (e.g., restricting Salary tab access exclusively to Admin)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access Denied. Role '${req.user?.role}' unauthorized.` });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
