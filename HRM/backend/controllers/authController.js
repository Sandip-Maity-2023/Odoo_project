const User = require('../models/User');
const Company = require('../models/Company');
const { generateEmployeeId } = require('../utils/idGenerator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token string builder utility helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// 1. Onboarding Company Entry Registration (Sign Up View Page Action)
const registerCompanyTenant = async (req, res) => {
  try {
    const { companyName, name, email, phone, password } = req.body;
    
    const companyExists = await Company.findOne({ email });
    const userExists = await User.findOne({ email });
    if (companyExists || userExists) return res.status(400).json({ message: 'Email already registered.' });

    // Save Tenant Company Info
    const newCompany = await Company.create({ companyName, adminName: name, email, phone });

    // Automatically provision structural Master Admin profile link for this register entry
    const nameSplit = name.trim().split(' ');
    const firstName = nameSplit[0] || 'Admin';
    const lastName = nameSplit[1] || 'User';
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      firstName,
      lastName,
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'Admin',
      isFirstLogin: false // Master tenant register admin bypasses password configuration loop
    });

    res.status(201).json({ message: 'Tenant onboarding system setup completed successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. HR / Admin Endpoint to Add a New User/Employee
const provisionNewEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User with this email already exists.' });

    // Dynamic identifier execution block
    const systemGeneratedId = await generateEmployeeId(firstName, lastName);

    // Auto-generate safe string matching temporary requirements rule notes
    const autoTemporaryPassword = crypto.randomBytes(4).toString('hex'); // 8 character random string
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(autoTemporaryPassword, salt);

    const employee = await User.create({
      customId: systemGeneratedId,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      password: hashedPassword,
      role: role || 'Employee',
      isFirstLogin: true // Intercepts initial sign-in attempt
    });

    res.status(201).json({
      message: 'Employee record built successfully.',
      customLoginId: systemGeneratedId,
      temporaryPassword: autoTemporaryPassword,
      note: 'Provide these credentials securely to the internal worker.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. User Authentication Endpoint (Supports Email or generated Custom Login ID)
const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { customId: identifier }]
    });
    if (!user) return res.status(404).json({ message: 'Invalid credentials. User matching identifier key not found.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password credential match.' });

    // Intercept check for temporary password requirements
    if (user.isFirstLogin) {
      return res.status(200).json({
        mustChangePassword: true,
        userId: user._id,
        message: 'System tracking mandatory password profile update validation cycle loop.'
      });
    }

    res.status(200).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, role: user.role, customId: user.customId }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Force Update Temporary Password Controller
const resetTemporaryPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      isFirstLogin: false
    });

    res.status(200).json({ message: 'Security credentials updated successfully. Proceed to login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerCompanyTenant, provisionNewEmployee, loginUser, resetTemporaryPassword };
