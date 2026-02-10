// multerConfig.js
const multer = require('multer');
const path = require('path');

// Use memory storage for multer (files kept in memory for Appwrite upload)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf';
    const isWord =
        file.mimetype === 'application/msword' ||
        file.mimetype ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const allow = (condition, errorMessage) => {
        if (condition) {
            cb(null, true);
        } else {
            cb(new Error(errorMessage));
        }
    };

    switch (file.fieldname) {
        case 'photo':
            return allow(isImage, 'Invalid image format. Only image files are allowed.');
        case 'guarantorFile':
            return allow(isPdf || isWord, 'Invalid guarantor file format. Only PDF/DOC/DOCX are allowed.');
        case 'cvResume':
            return allow(isPdf || isWord, 'Invalid CV/Resume format. Only PDF/DOC/DOCX are allowed.');
        case 'educationCertificates':
            return allow(isPdf || isWord || isImage, 'Invalid certificate format. Only PDF/DOC/DOCX/images are allowed.');
        case 'idPassport':
            return allow(isPdf || isImage, 'Invalid ID/Passport format. Only PDF/images are allowed.');
        case 'contractDocument':
            return allow(isPdf || isWord, 'Invalid contract format. Only PDF/DOC/DOCX are allowed.');
        case 'otherSupportingFiles':
            return allow(isPdf || isWord || isImage, 'Invalid supporting file format. Only PDF/DOC/DOCX/images are allowed.');
        default:
            return cb(new Error(`Unexpected file field: ${file.fieldname}`));
    }
};

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 9 * 1024 * 1024 }, // Limit file size to 9MB
    fileFilter: fileFilter
});

module.exports = upload;
