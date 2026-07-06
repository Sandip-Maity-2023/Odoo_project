const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  company_name: { type: String, required: true, trim: true },
  company_code: { type: String, required: true, uppercase: true, trim: true },
  customId: { type: String, unique: true, sparse: true },
  company_logo: {
    data: String,
    mimeType: String,
    fileName: String,
  },
  created_at: { type: Date, default: Date.now },
}, { timestamps: true });

companySchema.index({ company_name: 1 }, { unique: true });

module.exports = mongoose.model('Company', companySchema);
