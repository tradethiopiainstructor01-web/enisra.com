const User = require('../models/user.model');

exports.listPendingEmployers = async (_req, res) => {
  try {
    const employers = await User.find({
      role: /employer/i,
      requiresApproval: true,
    })
      .sort({ createdAt: -1 })
      .select('username fullName email role status requiresApproval createdAt')
      .lean();

    res.json({ success: true, data: employers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending employers',
      error: error.message,
    });
  }
};

exports.approveEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(
      id,
      { status: 'active', requiresApproval: false },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve employer',
      error: error.message,
    });
  }
};

exports.rejectEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(
      id,
      { status: 'inactive', requiresApproval: false },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject employer',
      error: error.message,
    });
  }
};
