const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    points: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    username: {
        type: String,
        required: true, // Required
        index: true, // Add index for faster queries
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'employee', 'HR', 'Enisra', 'Enisra', 'sales', 'salesmanager', 'tradextv', 'customerservice', 'SocialmediaManager', 'CustomerSuccessManager', 'TETV', 'IT', 'HR', 'supervisor', 'Instructor', 'EventManager', 'COO', 'TradeXTV', 'finance', 'reception', 'employer'],
        default: 'employee',
        index: true, // Add index for faster queries
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
        index: true, // Add index for faster queries
    },
    fullName: {
        type: String,
        required: false, // Optional
    },
    // Personal information (employee profile)
    firstName: {
        type: String,
        default: '',
    },
    middleName: {
        type: String,
        default: '',
    },
    lastName: {
        type: String,
        default: '',
    },
    dateOfBirth: {
        type: Date,
        required: false,
    },
    nationality: {
        type: String,
        default: '',
    },
    maritalStatus: {
        type: String,
        default: '',
    },
    nationalIdOrPassportNumber: {
        type: String,
        default: '',
    },
    altEmail: {
        type: String,
        default: '',
    },
    altPhone: {
        type: String,
        default: '',
    },
    emergencyContactName: {
        type: String,
        default: '',
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        default: 'male',
    },
    employmentType: {
        type: String,
        enum: ['full-time', 'part-time', 'remote', 'contract', 'intern'],
        required: false, // Optional
    },

    jobTitle: {
        type: String,
        required: false, // Optional
    },
    employeeId: {
        type: String,
        default: '',
        index: true,
    },
    department: {
        type: String,
        default: '',
        index: true,
    },
    position: {
        type: String,
        default: '',
    },
    workLocation: {
        type: String,
        default: '',
    },
    reportingManager: {
        type: String,
        default: '',
    },
    employmentStatus: {
        type: String,
        default: '',
    },
    salary: {
        type: Number,
        required: false,
        default: 0,
    },
    salaryDetails: {
        salaryType: { type: String, default: '' },
        basicSalary: { type: Number, required: false },
        allowances: { type: Number, required: false },
        paymentMethod: { type: String, default: '' },
        bankName: { type: String, default: '' },
        bankAccountNumber: { type: String, default: '' },
        contractStartDate: { type: Date, required: false },
        contractEndDate: { type: Date, required: false },
    },

    education: {
        type: String,
        required: false, // Optional
    },
    location: {
        type: String,
        required: false, // Optional
    },
    currentAddress: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    country: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        required: false, // Optional
    },
    additionalLanguages: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
    educationBackground: [
        {
            highestEducationLevel: { type: String, default: '' },
            fieldOfStudy: { type: String, default: '' },
            institutionName: { type: String, default: '' },
            graduationYear: { type: Number, required: false },
            certifications: { type: String, default: '' },
        },
    ],
    workExperience: [
        {
            previousCompanyName: { type: String, default: '' },
            jobTitle: { type: String, default: '' },
            startDate: { type: Date, required: false },
            endDate: { type: Date, required: false },
            keyResponsibilities: { type: String, default: '' },
        },
    ],
    technicalSkills: {
        type: [String],
        default: [],
    },
    softSkills: {
        type: [String],
        default: [],
    },
    languagesSpoken: [
        {
            language: { type: String, default: '' },
            proficiencyLevel: { type: String, default: '' },
        },
    ],
    // Employee document uploads (stored as Appwrite file IDs)
    cvResume: {
        type: String,
        default: '',
    },
    educationCertificates: {
        type: [String],
        default: [],
    },
    idPassport: {
        type: String,
        default: '',
    },
    contractDocument: {
        type: String,
        default: '',
    },
    otherSupportingFiles: {
        type: [String],
        default: [],
    },
    digitalId: {
        type: String, // Assuming this is a string identifier
        required: false, // Optional
    },
    photo: {
        type: mongoose.Schema.Types.Mixed, // Supports various types (e.g., URL, file path)
        required: false, // Optional
    },
    infoStatus: {
        type: String,
        default: 'pending',
        required: false, // Optional
    },
    trainingStatus: {
        type: String,
        required: false, // Optional
    },
    hireDate: {
        type: Date,
        required: false, // Optional
    },
    guarantorFile: {
        type: mongoose.Schema.Types.Mixed, // Supports various types (e.g., URL, file path)
        required: false, // Optional
    },
    requiresApproval: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
