const mongoose = require('mongoose');

const scholarshipContentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['scholarship', 'free-training'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 6000,
    },
    actionLabel: {
      type: String,
      trim: true,
      maxlength: 80,
      default: 'Open',
    },
    actionUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    videoUrls: {
      type: [String],
      default: [],
    },
    slideUrls: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScholarshipContent', scholarshipContentSchema);
