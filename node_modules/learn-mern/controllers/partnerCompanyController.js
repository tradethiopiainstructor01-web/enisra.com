const PartnerCompany = require('../models/PartnerCompany');
const { storage: appwriteStorage, InputFile } = require('../config/appwriteClient');
const { File } = require('node-fetch-native-with-agent');
const crypto = require('crypto');
const axios = require('axios');

const toTrimmedString = (value) => (value || '').toString().trim();
const normalizeRole = (role) => (role || '').toString().trim().toLowerCase();
const buildAppwriteFileUrl = (fileId) => {
  if (!fileId) return null;
  if (typeof fileId === 'string' && /^https?:\/\//i.test(fileId)) return fileId;
  return `https://cloud.appwrite.io/v1/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
};

const getCloudinaryConfig = () => {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  let apiKey = process.env.CLOUDINARY_API_KEY || '';
  let apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  if ((!cloudName || !apiKey || !apiSecret) && process.env.CLOUDINARY_URL) {
    const match = process.env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/i);
    if (match) {
      apiKey = apiKey || decodeURIComponent(match[1]);
      apiSecret = apiSecret || decodeURIComponent(match[2]);
      cloudName = cloudName || decodeURIComponent(match[3]);
    }
  }

  return { cloudName, apiKey, apiSecret };
};

const isCloudinaryConfigured = () => {
  const config = getCloudinaryConfig();
  return Boolean(config.cloudName && config.apiKey && config.apiSecret);
};

const buildAppwriteInputFile = (buffer, fileName, mimetype) => {
  if (InputFile && typeof InputFile.fromBuffer === 'function') {
    return InputFile.fromBuffer(buffer, fileName, mimetype);
  }
  return new File([buffer], fileName, { type: mimetype || 'application/octet-stream' });
};

const uploadImageToCloudinary = async (file, folder = 'partner-logos') => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured for image uploads.');
  }
  const cloudinary = getCloudinaryConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(`${signatureBase}${cloudinary.apiSecret}`)
    .digest('hex');

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`;
  const base64 = file.buffer.toString('base64');
  const dataUri = `data:${file.mimetype || 'application/octet-stream'};base64,${base64}`;

  const params = new URLSearchParams();
  params.append('file', dataUri);
  params.append('api_key', cloudinary.apiKey);
  params.append('timestamp', String(timestamp));
  params.append('folder', folder);
  params.append('signature', signature);

  const response = await axios.post(uploadUrl, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 20000,
  });

  const payload = response?.data || {};
  if (!payload?.secure_url) {
    throw new Error('Cloudinary upload did not return a secure URL.');
  }

  return payload;
};

exports.listApprovedPartners = async (_req, res) => {
  try {
    const partners = await PartnerCompany.find({ approved: true, active: true })
      .sort({ approvedAt: -1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: partners });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partner companies',
      error: error.message,
    });
  }
};

exports.listPendingPartners = async (_req, res) => {
  try {
    const partners = await PartnerCompany.find({ approved: false, active: true })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: partners });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending partner companies',
      error: error.message,
    });
  }
};

exports.listMyPartners = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const partners = await PartnerCompany.find({
      postedBy: req.user._id,
      active: true,
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: partners });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your partner companies',
      error: error.message,
    });
  }
};

exports.createPartner = async (req, res) => {
  try {
    const name = toTrimmedString(req.body.name);
    const logoUrl = toTrimmedString(req.body.logoUrl);
    const website = toTrimmedString(req.body.website);
    const isAdmin = normalizeRole(req.user?.role) === 'admin';
    const requestedApproved = req.body.approved === true;
    const approved = isAdmin && requestedApproved;

    if (!name || !logoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Company name and logo URL are required.',
      });
    }

    const exists = await PartnerCompany.findOne({
      name: new RegExp(`^${name}$`, 'i'),
      active: true,
    });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Company already exists.',
      });
    }

    const payload = {
      name,
      logoUrl,
      website,
      approved,
    };

    if (req.user) {
      payload.postedBy = req.user._id;
      if (approved) {
        payload.approvedBy = req.user._id;
        payload.approvedAt = new Date();
      }
    }

    const created = await PartnerCompany.create(payload);
    const message = approved
      ? 'Partner company created and approved.'
      : 'Partner company submitted and is pending admin approval.';
    res.status(201).json({ success: true, message, data: created });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create partner company',
      error: error.message,
    });
  }
};

exports.approvePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PartnerCompany.findByIdAndUpdate(
      id,
      {
        approved: true,
        approvedAt: new Date(),
        approvedBy: req.user?._id,
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve company',
      error: error.message,
    });
  }
};

exports.removePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PartnerCompany.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove company',
      error: error.message,
    });
  }
};

exports.uploadPartnerLogo = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Logo file is required.',
      });
    }

    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed.',
      });
    }

    if (isCloudinaryConfigured()) {
      const uploaded = await uploadImageToCloudinary(file, 'partner-logos');
      return res.status(201).json({
        success: true,
        data: {
          fileId: uploaded.public_id || uploaded.asset_id || null,
          logoUrl: uploaded.secure_url,
          originalName: file.originalname,
          provider: 'cloudinary',
        },
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
        fileId: uploaded.$id,
        logoUrl: buildAppwriteFileUrl(uploaded.$id),
        originalName: file.originalname,
        provider: 'appwrite',
      },
    });
  } catch (error) {
    const upstreamStatus =
      typeof error?.response?.status === 'number' ? error.response.status : null;
    const statusCode =
      upstreamStatus && upstreamStatus >= 400 && upstreamStatus < 600 ? upstreamStatus : 500;

    res.status(statusCode).json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to upload logo',
      error: error.message,
    });
  }
};
