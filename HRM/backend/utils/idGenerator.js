const User = require('../models/User');

const generateEmployeeID = async (companyName, firstName, lastName) => {
  const companyInitials = companyName.substring(0, 2).toUpperCase(); // e.g., OI
  const nameInitials = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase(); // e.g., JODO
  const year = new Date().getFullYear().toString(); // e.g., 2024
  
  // Find count of users joined this year for the serial number
  const count = await User.countDocuments({ 
    employeeId: { $regex: year } 
  });
  
  const serial = (count + 1).toString().padStart(4, '0'); // e.g., 0001
  
  return `${companyInitials}${nameInitials}${year}${serial}`;
};

module.exports = generateEmployeeID;