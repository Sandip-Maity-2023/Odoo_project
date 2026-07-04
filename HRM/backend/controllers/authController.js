const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateEmployeeID = require('../utils/generateID');

// 1. ADMIN SIGN UP
exports.registerAdmin = async (req, res) => {
    try {
        const { companyName, name, email, phone, password } = req.body;
        
        // Generate Unique ID for Admin
        const firstName = name.split(" ")[0];
        const lastName = name.split(" ")[1] || "XX";
        const employeeId = await generateEmployeeID(companyName, firstName, lastName);

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new User({
            employeeId,
            email,
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

        const user = await User.findOne({
            $or: [{ email: loginIdentifier }, { employeeId: loginIdentifier }]
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user._id,
                employeeId: user.employeeId,
                role: user.role,
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
        const { firstName, lastName, email, companyName } = req.body;

        // Auto-generate password for first time (Requirement)
        const tempPassword = Math.random().toString(36).slice(-8); 
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const employeeId = await generateEmployeeID(companyName, firstName, lastName);

        const newEmployee = new User({
            employeeId,
            email,
            password: hashedPassword,
            role: 'Employee',
            companyName,
            profile: { firstName, lastName }
        });

        await newEmployee.save();
        // Here you would typically send an email to the employee with their ID and tempPassword
        res.status(201).json({ message: "Employee Created", employeeId, tempPassword });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};