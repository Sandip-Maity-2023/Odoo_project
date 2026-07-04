const User = require('../models/User');

/**
 * Generates automated unique system employee ID strings 
 * Example Target Output: OIJODO20230001
 */
const generateEmployeeId = async (firstName, lastName) => {
  const companyPrefix = "OI"; // Odoo India
  
  // Sanitize names to safely take exactly 2 characters and convert to uppercase
  const fPart = firstName.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase().padEnd(2, 'X');
  const lPart = lastName.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase().padEnd(2, 'X');
  const namePart = `${fPart}${lPart}`;
  
  const currentYear = new Date().getFullYear();

  // Count existing structural documents tracking entries for this specific joining year
  const rawSerialIndex = await User.countDocuments({ joiningYear: currentYear });
  
  // Format serial index sequentially matching four digits padding (e.g., 0001, 0002)
  const serialPart = String(rawSerialIndex + 1).padStart(4, '0');

  return `${companyPrefix}${namePart}${currentYear}${serialPart}`;
};

module.exports = { generateEmployeeId };
