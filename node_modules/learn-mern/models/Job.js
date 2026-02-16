const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
    },
    description: {
      type: String,
      trim: true,
    },
    flow: {
      type: String,
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    postedByName: {
      type: String,
      trim: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
      default: true,
    },
    approved: {
      type: Boolean,
      default: false,
      index: true,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expirationDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

JobSchema.index({
  title: 'text',
  description: 'text',
  department: 'text',
  category: 'text',
  location: 'text',
  address: 'text',
  type: 'text',
});

module.exports = mongoose.model('Job', JobSchema);
