const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateEmployeeID = require('../utils/idGenerator');

const signToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const normalizeName = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || 'XX'
    };
};

// 1. ADMIN SIGN UP
exports.registerAdmin = async (req, res) => {
    try {
        const { companyName, name, email, phone, password } = req.body;

        if (!companyName || !name || !email || !password) {
            return res.status(400).json({ message: 'Company name, name, email and password are required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) return res.status(409).json({ message: 'Email is already registered' });

        // Generate Unique ID for Admin
        const { firstName, lastName } = normalizeName(name);
        const employeeId = await generateEmployeeID(companyName, firstName, lastName);

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new User({
            employeeId,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'Admin',
            companyName,
            profile: { firstName, lastName, phone }
        });

        await admin.save();
        res.status(201).json({ message: "Admin Registered", employeeId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. UNIVERSAL LOGIN (By Email or Employee ID)
exports.login = async (req, res) => {
    try {
        const { loginIdentifier, password } = req.body; // loginIdentifier can be Email or ID

        if (!loginIdentifier || !password) {
            return res.status(400).json({ message: 'Login ID/email and password are required' });
        }

        const user = await User.findOne({
            $or: [{ email: loginIdentifier.toLowerCase() }, { employeeId: loginIdentifier }]
        });

        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = signToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                employeeId: user.employeeId,
                role: user.role,
                email: user.email,
                name: `${user.profile.firstName} ${user.profile.lastName}`
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. ADMIN CREATES EMPLOYEE (Requirement: Normal users cannot register)
exports.createEmployee = async (req, res) => {
    try {
        const { firstName, lastName, email, companyName, role = 'Employee' } = req.body;

        if (!firstName || !lastName || !email) {
            return res.status(400).json({ message: 'First name, last name and email are required' });
        }

        const resolvedCompanyName = companyName || req.user?.companyName;
        if (!resolvedCompanyName) return res.status(400).json({ message: 'Company name is required' });

        if (!['Admin', 'HR', 'Employee'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) return res.status(409).json({ message: 'Email is already registered' });

        // Auto-generate password for first time (Requirement)
        const tempPassword = Math.random().toString(36).slice(-8); 
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const employeeId = await generateEmployeeID(resolvedCompanyName, firstName, lastName);

        const newEmployee = new User({
            employeeId,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            companyName: resolvedCompanyName,
            profile: { firstName, lastName }
        });

        await newEmployee.save();
        // Here you would typically send an email to the employee with their ID and tempPassword
        res.status(201).json({ message: "Employee Created", employeeId, tempPassword });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.registerCompanyTenant = exports.registerAdmin;
exports.loginUser = exports.login;
exports.provisionNewEmployee = exports.createEmployee;

exports.resetTemporaryPassword = async (req, res) => {
    try {
        const { loginIdentifier, temporaryPassword, newPassword } = req.body;

        if (!loginIdentifier || !temporaryPassword || !newPassword) {
            return res.status(400).json({ message: 'Login ID/email, temporary password and new password are required' });
        }

        const user = await User.findOne({
            $or: [{ email: loginIdentifier.toLowerCase() }, { employeeId: loginIdentifier }]
        });

        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(temporaryPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        user.password = await bcrypt.hash(newPassword, 10);
        user.isFirstLogin = false;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
