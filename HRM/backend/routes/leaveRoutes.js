const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  listLeaves,
  createLeave,
  reviewLeave,
  cancelLeave,
  listAllocations,
  upsertAllocation,
} = require('../controllers/leaveController');

const router = express.Router();

router.get('/', protect, listLeaves);
router.post('/', protect, createLeave);
router.patch('/:id/review', protect, reviewLeave);
router.patch('/:id/cancel', protect, cancelLeave);
router.get('/allocations/list', protect, listAllocations);
router.post('/allocations', protect, upsertAllocation);

module.exports = router;
