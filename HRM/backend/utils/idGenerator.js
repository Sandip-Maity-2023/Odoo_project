const User = require('../models/User');

const cleanPart = (value, fallback, length) => String(value || fallback)  //String(value || fallback): Turns the input into text, or uses the backup text if the main input is empty or missing.
  .replace(/[^a-z0-9]/gi, '')                                                           //Removes all symbols and spaces, leaving only letters and numbers.
  .substring(0, length)                    //Cuts the text down so it is not longer than the number you set.
  .padEnd(length, 'X')                     //Adds the letter "X" at the end if the text is too shor
  .toUpperCase();

const generateEmployeeID = async (companyName, firstName, lastName, companyId = null) => {  //null is used as a default value for the companyId parameter, allowing the function to be called without explicitly providing a companyId. If no companyId is provided, it will default to null.
  const cleanCompany = String(companyName || 'CO').replace(/[^a-z0-9]/gi, '');              //The Regular Expression /[^a-z0-9]/gi strips out all spaces, punctuation, and special characters, leaving only letters and numbers.
  const nameInitials = `${cleanPart(firstName, 'NA', 2)}${cleanPart(lastName, 'XX', 2)}`;   //Based on the arguments, cleanPart likely sanitises the names, takes the first 2 characters, and uses defaults like 'NA' (Not Available) or 'XX' if the names are missing
  const joiningYear = new Date().getFullYear();

  const query = { joining_year: joiningYear };
  if (companyId) query.company_id = companyId;                    //If you passed "Google", "John", and "Doe", the variables would look like this before hitting the database:companyInitials = "GO"nameInitials = "JODO" (assuming standard cleanPart behaviour)joiningYear = 2026The final ID structure is designed to look something like: GO-JODO-2026-001

  const latestEmployee = await User.findOne(query).sort({ serial_number: -1 }).select('serial_number');
  const serialNumber = (latestEmployee?.serial_number || 0) + 1;                                              //Increment (+ 1): It adds 1 to the last serial number. If it is the first employee, 0 + 1 = 1. If the last serial number was 42, it becomes 43
  const loginId = `${companyInitials}${nameInitials}${joiningYear}${String(serialNumber).padStart(4, '0')}`;  //.padStart(4, '0'): It converts the serial number to a string and forces it to be exactly 4 digits long by adding leading zeros. For example, 1 becomes "0001", and 43 becomes "0043"

  return { loginId, employeeId: loginId, joiningYear, serialNumber, companyCode: companyInitials };
};

module.exports = generateEmployeeID;
