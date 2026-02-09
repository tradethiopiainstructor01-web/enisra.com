const mongoose = require('mongoose');

const employerDetailsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    employerId: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    companyLocation: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    packageType: { type: String, required: true, trim: true },
    jobPostingCredits: { type: Number, required: true },
    contractEndDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmployerDetails', employerDetailsSchema);
