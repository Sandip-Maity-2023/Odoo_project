const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/company');
const generateEmployeeID = require('../utils/idGenerator');

const ROLES = ['Admin', 'HR', 'Employee'];
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?\d{10,15}$/;

const normalizeName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || 'XX',
  };
};

const validatePassword = (password) => passwordPattern.test(password || '');
const makeTemporaryPassword = () => `Hr@${crypto.randomBytes(5).toString('hex')}A1`;

const signAccessToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' },
);

const signRefreshToken = (user) => jwt.sign(
  { id: user._id, type: 'refresh' },
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
);

const serializeUser = (user) => ({
  id: user._id,
  companyId: user.company_id,
  employeeId: user.login_id,
  loginId: user.login_id,
  role: user.role,
  email: user.email,
  phone: user.phone,
  name: `${user.first_name} ${user.last_name}`.trim(),
  mustChangePassword: user.must_change_password,
});

const issueTokens = async (user) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refresh_tokens = [...(user.refresh_tokens || []).slice(-4), refreshToken];
  await user.save();
  return { accessToken, refreshToken };
};

const validateLogo = (logo = null) => {
  if (!logo?.data) return null;
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(logo.mimeType)) {
    throw new Error('Company logo must be a PNG, JPG, WEBP or SVG image');
  }
  const sizeBytes = Buffer.byteLength(logo.data, 'base64');
  if (sizeBytes > 1024 * 1024) throw new Error('Company logo must be 1MB or smaller');
  return logo;
};

exports.registerAdmin = async (req, res) => {
  try {
    const { companyName, companyLogo, name, email, phone, password, confirmPassword } = req.body;

    if (!companyName || !name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!emailPattern.test(email)) return res.status(400).json({ message: 'Enter a valid email address' });
    if (!phonePattern.test(phone)) return res.status(400).json({ message: 'Phone must be 10 to 15 digits' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must include uppercase, lowercase, number, special character and 8+ characters' });
    if (confirmPassword && password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(409).json({ message: 'Email is already registered' });

    const { firstName, lastName } = normalizeName(name);
    const idParts = await generateEmployeeID(companyName, firstName, lastName);
    const existingCompany = await Company.findOne({ company_name: companyName.trim() });
    if (existingCompany) return res.status(409).json({ message: 'Company is already registered' });

    const company = await Company.create({
      company_name: companyName.trim(),
      company_code: idParts.companyCode,
      company_logo: validateLogo(companyLogo),
    });

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await User.create({
      company_id: company._id,
      login_id: idParts.loginId,
      employeeId: idParts.employeeId,
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      phone,
      password_hash: passwordHash,
      password: passwordHash,
      temporary_password: null,
      must_change_password: false,
      isFirstLogin: false,
      joining_year: idParts.joiningYear,
      serial_number: idParts.serialNumber,
      role: 'Admin',
      companyName: company.company_name,
      profile: { firstName, lastName, phone },
    });

    res.status(201).json({ message: 'Admin registered', employeeId: admin.login_id, loginId: admin.login_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;
    if (!loginIdentifier || !password) return res.status(400).json({ message: 'Login ID and password are required' });

    const user = await User.findOne({
      $or: [{ email: loginIdentifier.toLowerCase() }, { login_id: loginIdentifier.toUpperCase() }, { employeeId: loginIdentifier.toUpperCase() }],
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const tokens = await issueTokens(user);
    res.json({ ...tokens, token: tokens.accessToken, user: serializeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, firstName, lastName, email, phone, role = 'Employee', department = '', jobPosition = '' } = req.body;
    const normalized = name ? normalizeName(name) : { firstName, lastName };
    if (!normalized.firstName || !normalized.lastName || !email || !phone) {
      return res.status(400).json({ message: 'Employee name, email and phone are required' });
    }
    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (role === 'Admin' && req.user.role !== 'Admin') return res.status(403).json({ message: 'Only Admin can create another Admin' });
    if (!emailPattern.test(email)) return res.status(400).json({ message: 'Enter a valid email address' });
    if (!phonePattern.test(phone)) return res.status(400).json({ message: 'Phone must be 10 to 15 digits' });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(409).json({ message: 'Email is already registered' });

    const company = await Company.findById(req.user.company_id);
    if (!company) return res.status(400).json({ message: 'Company was not found' });

    const idParts = await generateEmployeeID(company.company_name, normalized.firstName, normalized.lastName, company._id);
    const temporaryPassword = makeTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    const employee = await User.create({
      company_id: company._id,
      login_id: idParts.loginId,
      employeeId: idParts.employeeId,
      first_name: normalized.firstName,
      last_name: normalized.lastName,
      email: email.toLowerCase(),
      phone,
      password_hash: passwordHash,
      password: passwordHash,
      temporary_password: temporaryPassword,
      must_change_password: true,
      isFirstLogin: true,
      joining_year: idParts.joiningYear,
      serial_number: idParts.serialNumber,
      role,
      companyName: company.company_name,
      profile: { firstName: normalized.firstName, lastName: normalized.lastName, phone, department, jobPosition },
    });

    res.status(201).json({
      message: 'Employee created',
      employee: serializeUser(employee),
      loginId: employee.login_id,
      temporaryPassword,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new password are required' });
    if (!validatePassword(newPassword)) return res.status(400).json({ message: 'New password does not meet security rules' });

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.password_hash = passwordHash;
    user.password = passwordHash;
    user.temporary_password = null;
    user.must_change_password = false;
    user.isFirstLogin = false;
    await user.save();

    res.json({ message: 'Password updated successfully', user: serializeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token is required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.refresh_tokens.includes(refreshToken)) return res.status(401).json({ message: 'Invalid refresh token' });
    const accessToken = signAccessToken(user);
    res.json({ accessToken, token: accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Session expired' });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (req.user && refreshToken) {
    await User.findByIdAndUpdate(req.user._id, { $pull: { refresh_tokens: refreshToken } });
  }
  res.json({ message: 'Logged out' });
};

exports.getProfile = async (req, res) => res.json({ user: serializeUser(req.user) });

exports.registerCompanyTenant = exports.registerAdmin;
exports.loginUser = exports.login;
exports.provisionNewEmployee = exports.createEmployee;
exports.resetTemporaryPassword = exports.changePassword;
