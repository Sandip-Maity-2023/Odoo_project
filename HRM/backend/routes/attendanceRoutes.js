const express = require('express');
const { checkIn, checkOut, listAttendance, correctAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/', protect, listAttendance);
router.patch('/:id/correct', protect, correctAttendance);

module.exports = router;
