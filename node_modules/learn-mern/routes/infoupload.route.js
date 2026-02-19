const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user.model.js');
const upload = require('../multerConfig');
const { storage: appwriteStorage, isAppwriteConfigured, InputFile } = require('../config/appwriteClient');
const { File } = require('node-fetch-native-with-agent');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();

// Helper function to generate Appwrite file URL
function generateAppwriteFileUrl(fileId) {
  if (!fileId) return null;
  if (typeof fileId === 'string' && /^https?:\/\//i.test(fileId)) return fileId;
  return `https://cloud.appwrite.io/v1/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
}

function generateAppwriteFileUrls(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.filter(Boolean).map(generateAppwriteFileUrl);
}

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

const uploadImageToCloudinary = async (file) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured for image uploads.');
  }
  const cloudinary = getCloudinaryConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'employee-avatars';
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

  return payload.secure_url;
};

const buildAppwriteInputFile = (buffer, fileName, mimetype) => {
  if (InputFile && typeof InputFile.fromBuffer === 'function') {
    return InputFile.fromBuffer(buffer, fileName, mimetype);
  }
  return new File([buffer], fileName, { type: mimetype || 'application/octet-stream' });
};

const uploadInfoFields = [
  { name: 'photo', maxCount: 1 },
  { name: 'guarantorFile', maxCount: 1 },
  { name: 'cvResume', maxCount: 1 },
  { name: 'educationCertificates', maxCount: 10 },
  { name: 'idPassport', maxCount: 1 },
  { name: 'contractDocument', maxCount: 1 },
  { name: 'otherSupportingFiles', maxCount: 10 },
];
const uploadInfoMiddleware = upload.fields(uploadInfoFields);

// Define the upload route for photo and guarantor file
router.post('/upload-info', (req, res, next) => {
  uploadInfoMiddleware(req, res, (uploadError) => {
    if (!uploadError) {
      return next();
    }
    return res.status(400).json({
      success: false,
      message: uploadError.message || 'Invalid upload payload.',
    });
  });
},
  async (req, res) => {
    try {
      const userId = req.body.userId;
      const {
        photo,
        guarantorFile,
        cvResume,
        educationCertificates,
        idPassport,
        contractDocument,
        otherSupportingFiles,
      } = req.files || {};

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: 'User ID is required.' });
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid user ID.' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: 'User not found.' });
      }

      // Helper to upload a file buffer to Appwrite
      async function uploadToAppwrite(file, bucketId) {
        const { originalname, buffer, mimetype } = file;
        const fileName = `${Date.now()}-${originalname}`;

        // Build Appwrite-compatible input file from memory buffer.
        const inputFile = buildAppwriteInputFile(buffer, fileName, mimetype);

        // Upload file using the correct Appwrite method
        const result = await appwriteStorage.createFile({
          bucketId: bucketId,
          fileId: 'unique()', // Let Appwrite generate unique ID
          file: inputFile
        });

        return result.$id;
      }

      // Set your Appwrite bucket ID here
      const BUCKET_ID = process.env.APPWRITE_BUCKET_ID;
      const appwriteReady = Boolean(BUCKET_ID) && isAppwriteConfigured();

      // Upload photo (prefer Cloudinary for avatars; fallback to Appwrite when needed).
      if (photo && photo[0]) {
        if (isCloudinaryConfigured()) {
          user.photo = await uploadImageToCloudinary(photo[0]);
        } else if (appwriteReady) {
          user.photo = await uploadToAppwrite(photo[0], BUCKET_ID);
        } else {
          return res.status(503).json({
            success: false,
            message: 'Photo upload requires Cloudinary or Appwrite configuration.',
          });
        }
      }

      // Upload guarantor file to Appwrite
      if (guarantorFile && guarantorFile[0]) {
        if (!appwriteReady) {
          return res.status(503).json({
            success: false,
            message: 'Document uploads require Appwrite configuration.',
          });
        }
        const appwriteGuarantorId = await uploadToAppwrite(
          guarantorFile[0],
          BUCKET_ID
        );
        user.guarantorFile = appwriteGuarantorId;
      }

      // Upload CV / Resume
      if (cvResume && cvResume[0]) {
        if (!appwriteReady) {
          return res.status(503).json({
            success: false,
            message: 'Document uploads require Appwrite configuration.',
          });
        }
        const id = await uploadToAppwrite(cvResume[0], BUCKET_ID);
        user.cvResume = id;
      }

      // Upload education certificates (append)
      if (educationCertificates && educationCertificates.length) {
        if (!appwriteReady) {
          return res.status(503).json({
            success: false,
            message: 'Document uploads require Appwrite configuration.',
          });
        }
        const ids = [];
        for (const file of educationCertificates) {
          // eslint-disable-next-line no-await-in-loop
          ids.push(await uploadToAppwrite(file, BUCKET_ID));
        }
        user.educationCertificates = [...(user.educationCertificates || []), ...ids];
      }

      // Upload ID / Passport
      if (idPassport && idPassport[0]) {
        if (!appwriteReady) {
          return res.status(503).json({
            success: false,
            message: 'Document uploads require Appwrite configuration.',
          });
        }
        const id = await uploadToAppwrite(idPassport[0], BUCKET_ID);
        user.idPassport = id;
      }

      // Upload contract document
      if (contractDocument && contractDocument[0]) {
        if (!appwriteReady) {
          return res.status(503).json({
            success: false,
            message: 'Document uploads require Appwrite configuration.',
          });
        }
        const id = await uploadToAppwrite(contractDocument[0], BUCKET_ID);
        user.contractDocument = id;
      }

      // Upload other supporting files (append)
      if (otherSupportingFiles && otherSupportingFiles.length) {
        if (!appwriteReady) {
          return res.status(503).json({
            success: false,
            message: 'Document uploads require Appwrite configuration.',
          });
        }
        const ids = [];
        for (const file of otherSupportingFiles) {
          // eslint-disable-next-line no-await-in-loop
          ids.push(await uploadToAppwrite(file, BUCKET_ID));
        }
        user.otherSupportingFiles = [...(user.otherSupportingFiles || []), ...ids];
      }

      const didUpload =
        (photo && photo[0]) ||
        (guarantorFile && guarantorFile[0]) ||
        (cvResume && cvResume[0]) ||
        (educationCertificates && educationCertificates.length) ||
        (idPassport && idPassport[0]) ||
        (contractDocument && contractDocument[0]) ||
        (otherSupportingFiles && otherSupportingFiles.length);

      if (didUpload) {
        user.infoStatus = 'completed';
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Files uploaded successfully.',
        user: {
          _id: user._id,
          photo: user.photo,
          photoUrl: generateAppwriteFileUrl(user.photo),
          guarantorFile: user.guarantorFile,
          guarantorFileUrl: generateAppwriteFileUrl(user.guarantorFile),
          cvResume: user.cvResume,
          cvResumeUrl: generateAppwriteFileUrl(user.cvResume),
          educationCertificates: user.educationCertificates,
          educationCertificateUrls: generateAppwriteFileUrls(user.educationCertificates),
          idPassport: user.idPassport,
          idPassportUrl: generateAppwriteFileUrl(user.idPassport),
          contractDocument: user.contractDocument,
          contractDocumentUrl: generateAppwriteFileUrl(user.contractDocument),
          otherSupportingFiles: user.otherSupportingFiles,
          otherSupportingFileUrls: generateAppwriteFileUrls(user.otherSupportingFiles),
          infoStatus: user.infoStatus,
        },
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      const upstreamStatus =
        typeof error?.response?.status === 'number' ? error.response.status : null;
      const statusCode =
        upstreamStatus && upstreamStatus >= 400 && upstreamStatus < 600 ? upstreamStatus : 500;

      res.status(statusCode).json({
        success: false,
        message: error?.response?.data?.error?.message || error?.message || 'Server error.',
      });
    }
  }
);

// Get user with file URLs
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      user: {
        ...userObj,
        photoUrl: generateAppwriteFileUrl(userObj.photo),
        guarantorFileUrl: generateAppwriteFileUrl(userObj.guarantorFile),
        cvResumeUrl: generateAppwriteFileUrl(userObj.cvResume),
        educationCertificateUrls: generateAppwriteFileUrls(userObj.educationCertificates),
        idPassportUrl: generateAppwriteFileUrl(userObj.idPassport),
        contractDocumentUrl: generateAppwriteFileUrl(userObj.contractDocument),
        otherSupportingFileUrls: generateAppwriteFileUrls(userObj.otherSupportingFiles),
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
