const RegistrationEvent = require('../models/RegistrationEvent');

const logRegistrationEvent = async ({
  email,
  role,
  status,
  requiresApproval = false,
  source = 'public-register',
}) => {
  if (!email || !role || !status) {
    throw new Error('Missing required registration event fields');
  }

  await RegistrationEvent.create({
    email: email.toLowerCase(),
    role: role.toLowerCase(),
    status: status.toLowerCase(),
    requiresApproval,
    source,
  });
};

const createRegistrationEvent = async (req, res) => {
  try {
    const { email, role, status, requiresApproval, source } = req.body;
    await logRegistrationEvent({ email, role, status, requiresApproval, source });
    res.json({ success: true, message: 'Registration event recorded' });
  } catch (error) {
    console.error('Registration analytics error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getRegistrationSummary = async (req, res) => {
  try {
    const total = await RegistrationEvent.countDocuments();
    const last24h = await RegistrationEvent.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    const perRole = await RegistrationEvent.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({
      success: true,
      data: {
        total,
        last24h,
        perRole,
      },
    });
  } catch (error) {
    console.error('Failed to load registration summary:', error);
    res.status(500).json({ success: false, message: 'Unable to read registration analytics' });
  }
};

module.exports = {
  logRegistrationEvent,
  createRegistrationEvent,
  getRegistrationSummary,
};
