const mongoose =require('mongoose');
const companySchema = new mongoose.Schema({
    customId: { type: String, unique: true }, // Format: OIJODO20230001
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'HR', 'Employee'], default: 'Employee' },
  isFirstLogin: { type: Boolean, default: true }, // Forces user to change temporary password
  joiningYear: { type: Number, default: () => new Date().getFullYear() }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
