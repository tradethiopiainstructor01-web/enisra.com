const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["applied"], default: "applied" },
  },
  { timestamps: true }
);

ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model("Application", ApplicationSchema);
