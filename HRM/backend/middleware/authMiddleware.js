const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify if user is logged in
const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password -password_hash -temporary_password -refresh_tokens');
    if (!req.user) return res.status(401).json({ message: "User no longer exists" });
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

// Verify if user is an Admin (Requirement 3.6.2)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied." });
  }

  next();
};

module.exports = { protect, adminOnly, authorizeRoles };
