const EmployerDetails = require('../models/EmployerDetails');

const REQUIRED_FIELDS = [
  'employerId',
  'companyName',
  'industry',
  'category',
  'companyLocation',
  'contactPerson',
  'contactEmail',
  'contactPhone',
  'packageType',
  'jobPostingCredits',
  'contractEndDate',
];

const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
};

const validatePayload = (body) => {
  const missing = REQUIRED_FIELDS.filter((field) => isEmptyValue(body[field]));
  if (missing.length) {
    return { valid: false, message: `Missing required fields: ${missing.join(', ')}` };
  }

  const credits = Number(body.jobPostingCredits);
  if (Number.isNaN(credits)) {
    return { valid: false, message: 'Job Posting Credits must be a number.' };
  }

  const endDate = new Date(body.contractEndDate);
  if (Number.isNaN(endDate.getTime())) {
    return { valid: false, message: 'Contract End Date must be a valid date.' };
  }

  return { valid: true };
};

const normalizePayload = (body, userId) => ({
  user: userId,
  employerId: String(body.employerId || '').trim(),
  companyName: String(body.companyName || '').trim(),
  industry: String(body.industry || '').trim(),
  category: String(body.category || '').trim(),
  companyLocation: String(body.companyLocation || '').trim(),
  contactPerson: String(body.contactPerson || '').trim(),
  contactEmail: String(body.contactEmail || '').trim(),
  contactPhone: String(body.contactPhone || '').trim(),
  packageType: String(body.packageType || '').trim(),
  jobPostingCredits: Number(body.jobPostingCredits),
  contractEndDate: new Date(body.contractEndDate),
});

const getMyEmployerDetails = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const details = await EmployerDetails.findOne({ user: userId });
    if (!details) {
      return res.status(404).json({ success: false, message: 'Employer details not found' });
    }

    return res.json({ success: true, data: details });
  } catch (error) {
    console.error('Failed to load employer details:', error);
    return res.status(500).json({ success: false, message: 'Failed to load employer details' });
  }
};

const upsertMyEmployerDetails = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const validation = validatePayload(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const payload = normalizePayload(req.body, userId);
    const details = await EmployerDetails.findOneAndUpdate(
      { user: userId },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      data: details,
      message: 'Employer details saved successfully',
    });
  } catch (error) {
    console.error('Failed to save employer details:', error);
    return res.status(500).json({ success: false, message: 'Failed to save employer details' });
  }
};

module.exports = {
  getMyEmployerDetails,
  upsertMyEmployerDetails,
};
