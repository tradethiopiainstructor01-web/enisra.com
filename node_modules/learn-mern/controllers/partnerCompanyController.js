const PartnerCompany = require('../models/PartnerCompany');
const { storage: appwriteStorage } = require('../config/appwriteClient');
const { File } = require('node-fetch-native-with-agent');

const toTrimmedString = (value) => (value || '').toString().trim();
const normalizeRole = (role) => (role || '').toString().trim().toLowerCase();
const buildAppwriteFileUrl = (fileId) => {
  if (!fileId) return null;
  return `https://cloud.appwrite.io/v1/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
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
    const approved = isAdmin ? req.body.approved === true : false;

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
    res.status(201).json({ success: true, data: created });
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

    if (!process.env.APPWRITE_BUCKET_ID || !process.env.APPWRITE_PROJECT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Appwrite storage is not configured.',
      });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const fileObj = new File([file.buffer], fileName, { type: file.mimetype });
    const uploaded = await appwriteStorage.createFile({
      bucketId: process.env.APPWRITE_BUCKET_ID,
      fileId: 'unique()',
      file: fileObj,
    });

    res.status(201).json({
      success: true,
      data: {
        fileId: uploaded.$id,
        logoUrl: buildAppwriteFileUrl(uploaded.$id),
        originalName: file.originalname,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message,
    });
  }
};
