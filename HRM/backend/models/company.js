const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  company_name: { type: String, required: true, trim: true },
  company_code: { type: String, required: true, uppercase: true, trim: true },
  customId: { type: String, unique: true, sparse: true }, //In MongoDB, if you set a field to unique: true without sparse: true, MongoDB will treat missing (omitted) fields as having a value of null. Because null must be unique, you would only be allowed to save exactly one document that lacks a customId. Any subsequent document saved without a customId would throw a duplicate key error.
  company_logo: {
    data: String,
    mimeType: String,
    fileName: String,
  },
  created_at: { type: Date, default: Date.now },    //The { timestamps: true } option in Mongoose automatically adds createdAt and updatedAt date fields to your database schema. It saves creation time on insert and updates the edit time on every change
}, { timestamps: true });

companySchema.index({ company_name: 1 }, { unique: true });

module.exports = mongoose.model('Company', companySchema);

