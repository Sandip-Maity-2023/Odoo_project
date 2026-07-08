const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.patch('/update', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const {
      address,
      manager,
      location,
      department,
      jobPosition,
      phone,
      firstName,
      lastName,
      avatar,
      resume,
      privateInfo,
      resumeData,
    } = req.body;

    if (!user.profile) user.profile = {};
    if (address !== undefined) user.profile.address = address;
    if (manager !== undefined) user.profile.manager = manager;
    if (location !== undefined) user.profile.location = location;
    if (department !== undefined) user.profile.department = department;
    if (jobPosition !== undefined) user.profile.jobPosition = jobPosition;
    if (phone !== undefined) {
      user.phone = phone;
      user.profile.phone = phone;
    }
    if (firstName !== undefined) {
      user.first_name = firstName;
      user.profile.firstName = firstName;
    }
    if (lastName !== undefined) {
      user.last_name = lastName;
      user.profile.lastName = lastName;
    }
    if (avatar !== undefined) user.profile.avatar = avatar;
    if (privateInfo !== undefined) user.profile.privateInfo = privateInfo;
    if (resume !== undefined || resumeData !== undefined) {
      user.profile.resume = resume !== undefined ? resume : resumeData;
    }

    user.markModified('profile');
    await user.save();

    res.json({
      success: true,
      message: 'Profile details saved successfully',
      profile: user.profile,
    });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ success: false, message: 'Server error saving profile.', error: error.message });
  }
});

module.exports = router;
