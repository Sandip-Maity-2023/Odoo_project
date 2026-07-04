const express = require('express');
const router = express.Router();
const { 
  registerCompanyTenant, 
  provisionNewEmployee, 
  loginUser, 
  resetTemporaryPassword 
} = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/signup', registerCompanyTenant);
router.post('/login', loginUser);
router.post('/update-temporary-password', resetTemporaryPassword);
router.post('/create-employee', protect, authorizeRoles('Admin', 'HR'), provisionNewEmployee);


// Secured creation engine: Locked to Admin/HR level clearances only
router.post('/create-employee', protect, authorizeRoles('Admin', 'HR'), provisionNewEmployee);

module.exports = router;