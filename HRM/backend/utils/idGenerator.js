const User = require('../models/User');

const cleanPart = (value, fallback, length) => String(value || fallback)
  .replace(/[^a-z0-9]/gi, '')
  .substring(0, length)
  .padEnd(length, 'X')
  .toUpperCase();

const generateEmployeeID = async (companyName, firstName, lastName, companyId = null) => {
  const cleanCompany = String(companyName || 'CO').replace(/[^a-z0-9]/gi, '');
  const companyInitials = cleanCompany.substring(0, 2).padEnd(2, 'X').toUpperCase();
  const nameInitials = `${cleanPart(firstName, 'NA', 2)}${cleanPart(lastName, 'XX', 2)}`;
  const joiningYear = new Date().getFullYear();

  const query = { joining_year: joiningYear };
  if (companyId) query.company_id = companyId;

  const latestEmployee = await User.findOne(query).sort({ serial_number: -1 }).select('serial_number');
  const serialNumber = (latestEmployee?.serial_number || 0) + 1;
  const loginId = `${companyInitials}${nameInitials}${joiningYear}${String(serialNumber).padStart(4, '0')}`;

  return { loginId, employeeId: loginId, joiningYear, serialNumber, companyCode: companyInitials };
};

module.exports = generateEmployeeID;
