const express = require('express');
const User = require('../models/user.model.js');
const upload = require('../multerConfig');
const { storage: appwriteStorage } = require('../config/appwriteClient');
const { File } = require('node-fetch-native-with-agent'); // Import File class like in document routes

const router = express.Router();

// Helper function to generate Appwrite file URL
function generateAppwriteFileUrl(fileId) {
  if (!fileId) return null;
  return `https://cloud.appwrite.io/v1/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
}

function generateAppwriteFileUrls(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.filter(Boolean).map(generateAppwriteFileUrl);
}

// Define the upload route for photo and guarantor file
router.post(
  '/upload-info',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'guarantorFile', maxCount: 1 },
    { name: 'cvResume', maxCount: 1 },
    { name: 'educationCertificates', maxCount: 10 },
    { name: 'idPassport', maxCount: 1 },
    { name: 'contractDocument', maxCount: 1 },
    { name: 'otherSupportingFiles', maxCount: 10 },
  ]),
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
        
        // Create a File object from the buffer like in document routes
        const fileObj = new File([buffer], fileName, { type: mimetype });
        
        // Upload file using the correct Appwrite method
        const result = await appwriteStorage.createFile({
          bucketId: bucketId,
          fileId: 'unique()', // Let Appwrite generate unique ID
          file: fileObj
        });
        
        return result.$id;
      }

      // Set your Appwrite bucket ID here
      const BUCKET_ID = process.env.APPWRITE_BUCKET_ID;

      // Upload photo to Appwrite
      if (photo && photo[0]) {
        const appwritePhotoId = await uploadToAppwrite(photo[0], BUCKET_ID);
        user.photo = appwritePhotoId;
      }

      // Upload guarantor file to Appwrite
      if (guarantorFile && guarantorFile[0]) {
        const appwriteGuarantorId = await uploadToAppwrite(
          guarantorFile[0],
          BUCKET_ID
        );
        user.guarantorFile = appwriteGuarantorId;
      }

      // Upload CV / Resume
      if (cvResume && cvResume[0]) {
        const id = await uploadToAppwrite(cvResume[0], BUCKET_ID);
        user.cvResume = id;
      }

      // Upload education certificates (append)
      if (educationCertificates && educationCertificates.length) {
        const ids = [];
        for (const file of educationCertificates) {
          // eslint-disable-next-line no-await-in-loop
          ids.push(await uploadToAppwrite(file, BUCKET_ID));
        }
        user.educationCertificates = [...(user.educationCertificates || []), ...ids];
      }

      // Upload ID / Passport
      if (idPassport && idPassport[0]) {
        const id = await uploadToAppwrite(idPassport[0], BUCKET_ID);
        user.idPassport = id;
      }

      // Upload contract document
      if (contractDocument && contractDocument[0]) {
        const id = await uploadToAppwrite(contractDocument[0], BUCKET_ID);
        user.contractDocument = id;
      }

      // Upload other supporting files (append)
      if (otherSupportingFiles && otherSupportingFiles.length) {
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
      res.status(500).json({ success: false, message: 'Server error.' });
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
