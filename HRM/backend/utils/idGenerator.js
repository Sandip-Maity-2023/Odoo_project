const User = require('../models/User');

const generateEmployeeID = async (companyName, firstName, lastName) => {
  const cleanCompany = String(companyName || 'CO').replace(/[^a-z0-9]/gi, '');
  const cleanFirstName = String(firstName || 'NA').replace(/[^a-z0-9]/gi, '');
  const cleanLastName = String(lastName || 'XX').replace(/[^a-z0-9]/gi, '');
  const companyInitials = cleanCompany.substring(0, 2).padEnd(2, 'X').toUpperCase(); // e.g., OI
  const nameInitials = (
    cleanFirstName.substring(0, 2).padEnd(2, 'X') +
    cleanLastName.substring(0, 2).padEnd(2, 'X')
  ).toUpperCase(); // e.g., JODO
  const year = new Date().getFullYear().toString(); // e.g., 2024
  
  // Find count of users joined this year for the serial number
  const count = await User.countDocuments({ 
    employeeId: { $regex: year } 
  });
  
  const serial = (count + 1).toString().padStart(4, '0'); // e.g., 0001
  
  return `${companyInitials}${nameInitials}${year}${serial}`;
};

module.exports = generateEmployeeID;
