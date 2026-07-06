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
  listEmployees,
  updateEmployee,
  deleteEmployee,
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
router.get('/employees', protect, listEmployees);
router.post('/create-employee', protect, authorizeRoles('Admin', 'HR'), provisionNewEmployee);
router.put('/employees/:id', protect, updateEmployee);
router.delete('/employees/:id', protect, authorizeRoles('Admin', 'HR'), deleteEmployee);

module.exports = router;
