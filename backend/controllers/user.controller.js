const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model.js');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const { logRegistrationEvent } = require('./registrationAnalyticsController.js');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

const buildAppwriteUrl = (fileId) => {
    if (!fileId) return null;
    if (typeof fileId === 'string' && /^https?:\/\//i.test(fileId)) {
        return fileId;
    }
    return `https://cloud.appwrite.io/v1/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
};

const buildAppwriteUrls = (ids) => {
    if (!Array.isArray(ids)) return [];
    return ids.filter(Boolean).map(buildAppwriteUrl);
};

const buildAuthUserPayload = (user) => ({
    email: user.email,
    _id: user._id,
    username: user.username,
    role: user.role,
    status: user.status,
    fullName: user.fullName,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    nationality: user.nationality,
    maritalStatus: user.maritalStatus,
    nationalIdOrPassportNumber: user.nationalIdOrPassportNumber,
    altEmail: user.altEmail,
    altPhone: user.altPhone,
    emergencyContactName: user.emergencyContactName,
    gender: user.gender,
    jobTitle: user.jobTitle,
    hireDate: user.hireDate,
    employmentType: user.employmentType,
    education: user.education,
    location: user.location,
    currentAddress: user.currentAddress,
    city: user.city,
    country: user.country,
    phone: user.phone,
    additionalLanguages: user.additionalLanguages,
    salary: user.salary,
    salaryDetails: user.salaryDetails,
    notes: user.notes,
    employeeId: user.employeeId,
    department: user.department,
    position: user.position,
    workLocation: user.workLocation,
    reportingManager: user.reportingManager,
    employmentStatus: user.employmentStatus,
    educationBackground: user.educationBackground,
    workExperience: user.workExperience,
    technicalSkills: user.technicalSkills,
    softSkills: user.softSkills,
    languagesSpoken: user.languagesSpoken,
    digitalId: user.digitalId,
    photo: user.photo,
    photoUrl: buildAppwriteUrl(user.photo),
    infoStatus: user.infoStatus,
    trainingStatus: user.trainingStatus,
    guarantorFile: user.guarantorFile,
    guarantorFileUrl: buildAppwriteUrl(user.guarantorFile),
    cvResume: user.cvResume,
    cvResumeUrl: buildAppwriteUrl(user.cvResume),
    educationCertificates: user.educationCertificates,
    educationCertificateUrls: buildAppwriteUrls(user.educationCertificates),
    idPassport: user.idPassport,
    idPassportUrl: buildAppwriteUrl(user.idPassport),
    contractDocument: user.contractDocument,
    contractDocumentUrl: buildAppwriteUrl(user.contractDocument),
    otherSupportingFiles: user.otherSupportingFiles,
    otherSupportingFileUrls: buildAppwriteUrls(user.otherSupportingFiles),
});

const buildAuthResponse = (user, message = 'Login successful') => {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });

    return {
        success: true,
        message,
        token,
        user: buildAuthUserPayload(user),
    };
};

const normalizeRoleName = (role = '') =>
    role
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

const toSafeUserResponse = (user) => {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    return {
        ...userObj,
        photoUrl: buildAppwriteUrl(userObj.photo),
        guarantorFileUrl: buildAppwriteUrl(userObj.guarantorFile),
        cvResumeUrl: buildAppwriteUrl(userObj.cvResume),
        educationCertificateUrls: buildAppwriteUrls(userObj.educationCertificates),
        idPassportUrl: buildAppwriteUrl(userObj.idPassport),
        contractDocumentUrl: buildAppwriteUrl(userObj.contractDocument),
        otherSupportingFileUrls: buildAppwriteUrls(userObj.otherSupportingFiles),
    };
};

const getConfiguredGoogleClientIds = () => {
    const configuredValues = [
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_IDS,
        process.env.VITE_GOOGLE_CLIENT_ID,
    ]
        .filter(Boolean)
        .join(',');

    return configuredValues
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
};

const findUserByEmailInsensitive = async (email) => {
    const escapedEmail = escapeRegex(email);
    return User.findOne({
        email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') },
    });
};

const normalizeUsernameBase = (value = '') =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '')
        .replace(/^[._-]+|[._-]+$/g, '')
        .slice(0, 24);

const generateUniqueUsername = async ({ email = '', fullName = '' }) => {
    const emailLocal = email.includes('@') ? email.split('@')[0] : email;
    const fullNameLocal = fullName
        .split(/\s+/)
        .filter(Boolean)
        .join('.');

    const base = normalizeUsernameBase(emailLocal) || normalizeUsernameBase(fullNameLocal) || 'user';
    let candidate = base;

    for (let attempt = 0; attempt < 15; attempt += 1) {
        const exists = await User.exists({
            $or: [{ username: candidate }, { username: candidate.toLowerCase() }],
        });
        if (!exists) {
            return candidate;
        }
        candidate = `${base}${Math.floor(Math.random() * 9000) + 1000}`;
    }

    return `${base}${Date.now().toString().slice(-6)}`;
};

// Health check endpoint for users
const userHealthCheck = async (req, res) => {
  try {
    console.log('User health check called');
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      mongoUri: process.env.MONGO_URI ? 'SET' : 'NOT SET'
    });
    
    // Check if database is connected
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    console.log('Database status:', dbStatus);
    
    res.json({ 
      success: true,
      status: 'OK',
      database: dbStatus,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('User health check failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'User health check failed',
      error: error.message,
    });
  }
};

// User login function
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const identifier = typeof email === 'string' ? email.trim() : '';

    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: "Please provide both email/username and password" });
    }

    try {
        // Check if database is connected
        if (!mongoose.connection.readyState) {
            return res.status(500).json({ success: false, message: "Database connection error" });
        }
        
        const escapedIdentifier = escapeRegex(identifier);
        const user = await User.findOne({
            $or: [
                { email: { $regex: new RegExp(`^${escapedIdentifier}$`, 'i') } },
                { username: identifier },
                { username: identifier.toLowerCase() },
            ],
        });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email/username or password" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email/username or password" });
        }
        if (user.status !== 'active') {
            return res.status(403).json({ success: false, message: "Account is not active yet. Awaiting approval." });
        }

        // Keep sessions active for 2 hours per requirement.
        return res.status(200).json(buildAuthResponse(user, 'Login successful'));
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Google login function
const googleLoginUser = async (req, res) => {
    const credential = typeof req.body?.credential === 'string' ? req.body.credential.trim() : '';

    if (!credential) {
        return res.status(400).json({ success: false, message: 'Google credential is required.' });
    }

    try {
        if (!mongoose.connection.readyState) {
            return res.status(500).json({ success: false, message: "Database connection error" });
        }

        const allowedClientIds = getConfiguredGoogleClientIds();
        if (!allowedClientIds.length) {
            return res.status(500).json({
                success: false,
                message: 'Google login is not configured on the server.',
            });
        }

        const { data: tokenInfo } = await axios.get(GOOGLE_TOKENINFO_URL, {
            params: { id_token: credential },
            timeout: 10000,
        });

        const email =
            typeof tokenInfo?.email === 'string' ? tokenInfo.email.trim().toLowerCase() : '';
        const aud = typeof tokenInfo?.aud === 'string' ? tokenInfo.aud.trim() : '';
        const emailVerified =
            tokenInfo?.email_verified === true || tokenInfo?.email_verified === 'true';

        if (!email || !emailVerified) {
            return res
                .status(401)
                .json({ success: false, message: 'Google account email is not verified.' });
        }

        if (!allowedClientIds.includes(aud)) {
            return res.status(401).json({
                success: false,
                message: 'Google token is not valid for this application.',
            });
        }

        let user = await findUserByEmailInsensitive(email);
        let created = false;

        if (!user) {
            const fullName = typeof tokenInfo?.name === 'string' ? tokenInfo.name.trim() : '';
            const firstName =
                typeof tokenInfo?.given_name === 'string' ? tokenInfo.given_name.trim() : '';
            const lastName =
                typeof tokenInfo?.family_name === 'string' ? tokenInfo.family_name.trim() : '';
            const picture = typeof tokenInfo?.picture === 'string' ? tokenInfo.picture.trim() : '';
            const username = await generateUniqueUsername({ email, fullName });

            user = new User({
                username,
                email,
                password: crypto.randomBytes(32).toString('hex'),
                role: 'employee',
                status: 'active',
                fullName,
                firstName,
                lastName,
                photo: picture,
            });

            await user.save();
            created = true;

            try {
                await logRegistrationEvent({
                    email,
                    role: user.role,
                    status: user.status,
                    requiresApproval: false,
                    source: 'google-login',
                });
            } catch (logError) {
                console.warn('Google registration analytics tracking failed:', logError.message);
            }
        } else {
            // Backfill optional profile fields from Google when absent.
            let shouldSave = false;
            if (!user.fullName && typeof tokenInfo?.name === 'string' && tokenInfo.name.trim()) {
                user.fullName = tokenInfo.name.trim();
                shouldSave = true;
            }
            if (!user.firstName && typeof tokenInfo?.given_name === 'string' && tokenInfo.given_name.trim()) {
                user.firstName = tokenInfo.given_name.trim();
                shouldSave = true;
            }
            if (!user.lastName && typeof tokenInfo?.family_name === 'string' && tokenInfo.family_name.trim()) {
                user.lastName = tokenInfo.family_name.trim();
                shouldSave = true;
            }
            if (!user.photo && typeof tokenInfo?.picture === 'string' && tokenInfo.picture.trim()) {
                user.photo = tokenInfo.picture.trim();
                shouldSave = true;
            }

            if (shouldSave) {
                await user.save();
            }
        }

        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is not active yet. Awaiting approval.',
            });
        }

        const successMessage = created
            ? 'Google account created and login successful.'
            : 'Login successful';

        return res.status(200).json(buildAuthResponse(user, successMessage));
    } catch (error) {
        const tokenStatus = error?.response?.status;
        if (tokenStatus === 400) {
            return res.status(401).json({ success: false, message: 'Invalid Google credential.' });
        }

        console.error('Error during Google login:', error.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create a new user
const createuser = async (req, res) => {
    const { 
        username, email, password, role, status, 
        fullName, altEmail, altPhone, gender, 
        jobTitle, hireDate, employmentType, 
        education, location, phone, additionalLanguages, 
        notes,digitalId,photo,infoStatus,trainingStatus,guarantorFile,
        salary
    } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    try {
        // Check if database is connected
        if (!mongoose.connection.readyState) {
            return res.status(500).json({ success: false, message: "Database connection error" });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }

        // Set default status if not provided
        const normalizedRole = (role || '').toLowerCase();
        const requiresApproval = normalizedRole === 'employer';
        const userStatus = requiresApproval ? 'pending' : (status || 'active');

        const newUser = new User({ 
            username, 
            email, 
            password, 
            role, 
            status: userStatus,
            requiresApproval,
            fullName,
            altEmail,
            altPhone,
            gender,
            jobTitle,
            hireDate,
            employmentType,
            education,
            location,
            phone,
            additionalLanguages,
            notes,
            digitalId,
            photo,
            infoStatus,
            trainingStatus,
            guarantorFile,
            salary: salary !== undefined && salary !== null ? Number(salary) : undefined
        });
        await newUser.save();
        try {
            await logRegistrationEvent({
                email,
                role,
                status: userStatus,
                requiresApproval,
                source: 'public-register',
            });
        } catch (logError) {
            console.warn('Registration analytics tracking failed:', logError.message);
        }
        res.status(201).json({ success: true, data: newUser });

    } catch (error) {
        console.error("Error in creating user:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get all users
const getuser = async (req, res) => {
    try {
        console.log('Get users called');
        console.log('Environment:', {
          nodeEnv: process.env.NODE_ENV
        });
        
        // Check if database is connected
        if (!mongoose.connection.readyState) {
            console.log('Database not connected');
            return res.status(500).json({ success: false, message: "Database connection error" });
        }
        
        console.log('Fetching users from database');
        const users = await User.find({});
        
        // Add Appwrite file URLs to each user
        const usersWithUrls = users.map(user => {
            const userObj = user.toObject();
            return {
                ...userObj,
                photoUrl: buildAppwriteUrl(userObj.photo),
                guarantorFileUrl: buildAppwriteUrl(userObj.guarantorFile),
            };
        });
        
        res.status(200).json({ success: true, data: usersWithUrls });
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Update user by ID
const updateuser = async (req, res) => {
    const { id } = req.params;
    const userUpdates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid user ID" });
    }

    try {
        // Check if database is connected
        if (!mongoose.connection.readyState) {
            return res.status(500).json({ success: false, message: "Database connection error" });
        }
        
        if (userUpdates.password) {
            const salt = await bcrypt.genSalt(10);
            userUpdates.password = await bcrypt.hash(userUpdates.password, salt);
        }
        // Update user and return the updated user
        const updatedUser = await User.findByIdAndUpdate(id, userUpdates, { new: true });
        res.status(200).json({ success: true, message: "User updated successfully!", data: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ success: false, message: "Failed to update user" });
    }
};

// Delete user by ID
const deleteuser = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid user ID" });
    }

    try {
        // Check if database is connected
        if (!mongoose.connection.readyState) {
            return res.status(500).json({ success: false, message: "Database connection error" });
        }
        
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User deleted" });
        console.log("User deleted:", id);
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get user counts
const getUserCounts = async (req, res) => {
    try {
        // Check if database is connected
        if (!mongoose.connection.readyState) {
            return res.status(500).json({ success: false, message: "Database connection error" });
        }
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        res.status(200).json({ success: true, data: { totalUsers, activeUsers } });
    } catch (error) {
        console.error("Error fetching user counts:", error.message);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get user profile information by ID
const getUserInfoById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid user ID" });
    }

    try {
        if (!mongoose.connection.readyState) {
            return res.status(500).json({ success: false, message: "Database connection error" });
        }

        if (!req.user?._id) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        const requestorRole = normalizeRoleName(req.user.role);
        const isPrivileged = ['admin', 'hr'].includes(requestorRole);
        const isSelfRequest = req.user._id.toString() === id;

        if (!isPrivileged && !isSelfRequest) {
            return res.status(403).json({ success: false, message: "Not authorized to access this profile" });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            data: toSafeUserResponse(user),
        });
    } catch (error) {
        console.error("Error fetching user information by id:", {
            userId: id,
            errorName: error?.name,
            errorMessage: error?.message,
        });
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Update user information based on user input
const updateUserInfo = async (req, res) => {
    const { id } = req.params;
    const userUpdates = { ...(req.body || {}) };
    let sanitizedUpdates = {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid user ID" });
    }

    try {
        // Check if database is connected
        if (!mongoose.connection.readyState) {
            return res.status(500).json({ success: false, message: "Database connection error" });
        }

        // Never allow updating immutable/sensitive fields via the profile form payload.
        delete userUpdates._id;
        delete userUpdates.password;
        delete userUpdates.role;
        delete userUpdates.points;
        delete userUpdates.rating;
        delete userUpdates.requiresApproval;

        const normalizeEnum = (value, allowedValues) => {
            if (typeof value !== 'string') return undefined;
            const normalized = value.trim().toLowerCase();
            if (!normalized) return undefined;
            return allowedValues.includes(normalized) ? normalized : undefined;
        };

        const stripUndefinedDeep = (value) => {
            if (Array.isArray(value)) {
                return value.map(stripUndefinedDeep).filter((item) => item !== undefined);
            }

            if (value && typeof value === 'object' && !(value instanceof Date)) {
                return Object.entries(value).reduce((acc, [key, nestedValue]) => {
                    const cleaned = stripUndefinedDeep(nestedValue);
                    if (cleaned !== undefined) {
                        acc[key] = cleaned;
                    }
                    return acc;
                }, {});
            }

            return value === undefined ? undefined : value;
        };

        // Normalize commonly mismatched enum fields from legacy profile values.
        if (Object.prototype.hasOwnProperty.call(userUpdates, 'gender')) {
            userUpdates.gender = normalizeEnum(userUpdates.gender, ['male', 'female']);
        }
        if (Object.prototype.hasOwnProperty.call(userUpdates, 'employmentType')) {
            const rawEmploymentType = typeof userUpdates.employmentType === 'string'
                ? userUpdates.employmentType.trim().toLowerCase()
                : '';
            const mappedEmploymentType =
                rawEmploymentType === 'fulltime' ? 'full-time' :
                rawEmploymentType === 'parttime' ? 'part-time' :
                rawEmploymentType;

            userUpdates.employmentType = normalizeEnum(
                mappedEmploymentType,
                ['full-time', 'part-time', 'remote', 'contract', 'intern']
            );
        }

        // Avoid Date cast errors from empty string values.
        if (userUpdates.dateOfBirth === '') delete userUpdates.dateOfBirth;
        if (userUpdates.hireDate === '') delete userUpdates.hireDate;

        if (Array.isArray(userUpdates.workExperience)) {
            userUpdates.workExperience = userUpdates.workExperience.map((item) => {
                const nextItem = { ...(item || {}) };
                if (nextItem.startDate === '') delete nextItem.startDate;
                if (nextItem.endDate === '') delete nextItem.endDate;
                return nextItem;
            });
        }

        if (userUpdates.salaryDetails && typeof userUpdates.salaryDetails === 'object') {
            const salaryDetails = { ...userUpdates.salaryDetails };
            if (salaryDetails.contractStartDate === '') delete salaryDetails.contractStartDate;
            if (salaryDetails.contractEndDate === '') delete salaryDetails.contractEndDate;
            userUpdates.salaryDetails = salaryDetails;
        }

        sanitizedUpdates = stripUndefinedDeep(userUpdates);
        
        // Update user based on new information
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: sanitizedUpdates },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const userObj = updatedUser.toObject();
        delete userObj.password;

        res.status(200).json({ success: true, message: "User information updated successfully!", data: userObj });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const fieldErrors = Object.entries(error.errors || {}).map(([field, item]) => ({
                field,
                kind: item?.kind || 'validation',
                message: item?.message || 'Invalid value',
            }));

            console.error("Validation error updating user information:", {
                userId: id,
                fields: fieldErrors,
                payloadKeys: Object.keys(sanitizedUpdates || {}),
            });

            return res.status(400).json({
                success: false,
                message: "Invalid profile data",
                errors: fieldErrors.map((item) => item.message),
                fields: fieldErrors,
            });
        }

        if (error instanceof mongoose.Error.CastError) {
            console.error("Cast error updating user information:", {
                userId: id,
                field: error.path,
                valueType: typeof error.value,
                payloadKeys: Object.keys(sanitizedUpdates || {}),
                message: error.message,
            });

            return res.status(400).json({
                success: false,
                message: `Invalid value for field: ${error.path}`,
                field: error.path,
                error: error.message,
            });
        }

        if (error?.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0] || 'field';
            console.error("Duplicate key error updating user information:", {
                userId: id,
                duplicateField,
                payloadKeys: Object.keys(sanitizedUpdates || {}),
            });
            return res.status(409).json({
                success: false,
                message: `Duplicate value for ${duplicateField}`,
            });
        }

        console.error("Unexpected error updating user information:", {
            userId: id,
            errorName: error?.name,
            errorMessage: error?.message,
            payloadKeys: Object.keys(sanitizedUpdates || {}),
        });
        res.status(500).json({ success: false, message: "Failed to update user information", error: error.message });
    }
};

// Get currently authenticated user
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        res.status(200).json({
            success: true,
            data: toSafeUserResponse(req.user)
        });
    } catch (error) {
        console.error("Error fetching current user:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    userHealthCheck,
    loginUser,
    googleLoginUser,
    createuser,
    getuser,
    updateuser,
    deleteuser,
    getUserCounts,
    getUserInfoById,
    updateUserInfo,
    getMe
};
