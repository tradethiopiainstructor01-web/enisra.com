const ScholarshipContent = require('../models/ScholarshipContent');
const { storage: appwriteStorage, InputFile } = require('../config/appwriteClient');
const { File } = require('node-fetch-native-with-agent');
const mongoose = require('mongoose');

const normalizeUrlArray = (value) => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split(/\r?\n|,/);
  return list
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 20);
};

const buildAppwriteInputFile = (buffer, fileName, mimetype) => {
  if (InputFile && typeof InputFile.fromBuffer === 'function') {
    return InputFile.fromBuffer(buffer, fileName, mimetype);
  }
  return new File([buffer], fileName, { type: mimetype || 'application/octet-stream' });
};

const buildAppwriteFileUrl = (fileId) =>
  `https://cloud.appwrite.io/v1/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.APPWRITE_PROJECT_ID}`;

const uploadScholarshipResource = async (req, res) => {
  try {
    const file = req.file;
    const resourceType = (req.body?.resourceType || '').toString().trim().toLowerCase();

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'File is required.',
      });
    }

    if (resourceType !== 'video' && resourceType !== 'slide') {
      return res.status(400).json({
        success: false,
        message: "resourceType must be 'video' or 'slide'.",
      });
    }

    const missingAppwriteKeys = [
      'APPWRITE_ENDPOINT',
      'APPWRITE_PROJECT_ID',
      'APPWRITE_API_KEY',
      'APPWRITE_BUCKET_ID',
    ].filter((key) => !process.env[key]);

    if (missingAppwriteKeys.length) {
      return res.status(500).json({
        success: false,
        message: `Storage is not configured. Missing: ${missingAppwriteKeys.join(', ')}`,
      });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const fileObj = buildAppwriteInputFile(file.buffer, fileName, file.mimetype);
    const uploaded = await appwriteStorage.createFile({
      bucketId: process.env.APPWRITE_BUCKET_ID,
      fileId: 'unique()',
      file: fileObj,
    });

    return res.status(201).json({
      success: true,
      data: {
        resourceType,
        fileId: uploaded.$id,
        fileUrl: buildAppwriteFileUrl(uploaded.$id),
        originalName: file.originalname,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to upload file.',
    });
  }
};

const listPublishedScholarshipContent = async (req, res) => {
  try {
    const items = await ScholarshipContent.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load scholarship content.',
    });
  }
};

const listScholarshipContentForAdmin = async (req, res) => {
  try {
    const items = await ScholarshipContent.find({})
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load scholarship content.',
    });
  }
};

const createScholarshipContent = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      actionLabel,
      actionUrl,
      videoUrls,
      slideUrls,
      isPublished = true,
    } = req.body || {};

    const normalizedType = (type || '').toString().trim().toLowerCase();
    if (normalizedType !== 'scholarship' && normalizedType !== 'free-training') {
      return res.status(400).json({
        success: false,
        message: "Type must be 'scholarship' or 'free-training'.",
      });
    }

    if (!title?.toString().trim() || !description?.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.',
      });
    }

    const createdBy =
      req.user?._id && mongoose.isValidObjectId(req.user._id) ? req.user._id : null;

    const created = await ScholarshipContent.create({
      type: normalizedType,
      title: title.toString().trim(),
      description: description.toString().trim(),
      actionLabel: actionLabel?.toString().trim() || 'Open',
      actionUrl: actionUrl?.toString().trim() || '',
      videoUrls: normalizedType === 'free-training' ? normalizeUrlArray(videoUrls) : [],
      slideUrls: normalizedType === 'free-training' ? normalizeUrlArray(slideUrls) : [],
      isPublished: Boolean(isPublished),
      createdBy,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    if (error?.name === 'ValidationError') {
      const firstValidationMessage =
        Object.values(error.errors || {})[0]?.message || 'Validation failed.';
      return res.status(400).json({
        success: false,
        message: firstValidationMessage,
      });
    }

    if (error?.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid value for field '${error.path}'.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create scholarship content.',
    });
  }
};

const updateScholarshipContent = async (req, res) => {
  try {
    const { id } = req.params || {};
    const {
      type,
      title,
      description,
      actionLabel,
      actionUrl,
      videoUrls,
      slideUrls,
      isPublished = true,
    } = req.body || {};

    const normalizedType = (type || '').toString().trim().toLowerCase();
    if (normalizedType !== 'scholarship' && normalizedType !== 'free-training') {
      return res.status(400).json({
        success: false,
        message: "Type must be 'scholarship' or 'free-training'.",
      });
    }

    if (!title?.toString().trim() || !description?.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.',
      });
    }

    const payload = {
      type: normalizedType,
      title: title.toString().trim(),
      description: description.toString().trim(),
      actionLabel: actionLabel?.toString().trim() || 'Open',
      actionUrl: actionUrl?.toString().trim() || '',
      videoUrls: normalizedType === 'free-training' ? normalizeUrlArray(videoUrls) : [],
      slideUrls: normalizedType === 'free-training' ? normalizeUrlArray(slideUrls) : [],
      isPublished: Boolean(isPublished),
    };

    const updated = await ScholarshipContent.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Content item not found.',
      });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    if (error?.name === 'ValidationError') {
      const firstValidationMessage =
        Object.values(error.errors || {})[0]?.message || 'Validation failed.';
      return res.status(400).json({
        success: false,
        message: firstValidationMessage,
      });
    }

    if (error?.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid value for field '${error.path}'.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update scholarship content.',
    });
  }
};

const deleteScholarshipContent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ScholarshipContent.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Content item not found.',
      });
    }
    return res.json({ success: true, message: 'Content deleted successfully.' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete scholarship content.',
    });
  }
};

module.exports = {
  listPublishedScholarshipContent,
  listScholarshipContentForAdmin,
  createScholarshipContent,
  updateScholarshipContent,
  deleteScholarshipContent,
  uploadScholarshipResource,
};
