const User = require('../models/company');
const crypto = require('crypto'); // Built-in Node utility to generate temporary passwords
const bcrypt = require('bcryptjs');

// Controller for HR / Admin to create a new Employee
const createEmployeeByHR = async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;
    const currentYear = new Date().getFullYear();

    // 1. Generate Custom ID String Elements
    const companyPrefix = "OI"; // Odoo India
    const namePart = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
    
    // 2. Query serial sequencing from Database for current year
    const userCountThisYear = await User.countDocuments({ joiningYear: currentYear });
    const serialNumber = String(userCountThisYear + 1).padStart(4, '0'); // Example: "0001"

    const customGeneratedId = `${companyPrefix}${namePart}${currentYear}${serialNumber}`;

    // 3. Generate Temporary Random Password
    const temporaryPassword = crypto.randomBytes(4).toString('hex'); // Generates an 8-character string
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    // 4. Save Record
    const newEmployee = new User({
      customId: customGeneratedId,
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role: role || 'Employee',
      joiningYear: currentYear,
      isFirstLogin: true // Forces update configuration on first log in
    });

    await newEmployee.save();

    // 5. Send back details (In production, you'd email these credentials to the worker)
    res.status(201).json({
      message: "Employee Created Successfully!",
      loginId: customGeneratedId,
      temporaryPassword: temporaryPassword, // Present it once to the HR administrator
      note: "User must update password upon first logging in."
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
