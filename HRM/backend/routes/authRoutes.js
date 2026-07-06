const express = require('express');
const router = express.Router();
const { 
  registerCompanyTenant, 
  provisionNewEmployee, 
  loginUser, 
  resetTemporaryPassword,
  refreshToken,
  logout,
  getProfile,
} = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/securityMiddleware');

router.post('/signup', registerCompanyTenant);
router.post('/login', loginLimiter, loginUser);
router.post('/refresh-token', refreshToken);
router.post('/update-temporary-password', protect, resetTemporaryPassword);
router.post('/change-password', protect, resetTemporaryPassword);
router.post('/logout', protect, logout);
router.get('/me', protect, getProfile);
router.post('/create-employee', protect, authorizeRoles('Admin', 'HR'), provisionNewEmployee);

module.exports = router;
