const Job = require('../models/Job');

const toTrimmedString = (value) => (value || '').toString().trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

exports.listJobs = async (req, res) => {
  try {
    const {
      q,
      location,
      category,
      type,
      page = 1,
      limit = 25,
      active,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 100);
    const filter = {};

    if (active !== 'false') {
      filter.active = true;
    }

    // Only show approved jobs on public list
    filter.approved = true;

    if (location) {
      filter.location = new RegExp(escapeRegex(location), 'i');
    }

    if (category) {
      filter.category = new RegExp(escapeRegex(category), 'i');
    }

    if (type) {
      filter.type = new RegExp(escapeRegex(type), 'i');
    }

    if (q) {
      const qRegex = new RegExp(escapeRegex(q), 'i');
      filter.$or = [
        { title: qRegex },
        { description: qRegex },
        { department: qRegex },
        { category: qRegex },
        { location: qRegex },
        { type: qRegex },
      ];
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ postedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Job.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: jobs,
      total,
      page: pageNumber,
      limit: limitNumber,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message,
    });
  }
};

exports.listPendingJobs = async (_req, res) => {
  try {
    const jobs = await Job.find({ approved: false, active: true })
      .sort({ postedAt: -1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending jobs',
      error: error.message,
    });
  }
};

exports.createJob = async (req, res) => {
  try {
    const payload = {
      title: toTrimmedString(req.body.title),
      department: toTrimmedString(req.body.department),
      category: toTrimmedString(req.body.category),
      location: toTrimmedString(req.body.location),
      type: toTrimmedString(req.body.type),
      salary: toTrimmedString(req.body.salary),
      description: toTrimmedString(req.body.description),
      flow: toTrimmedString(req.body.flow),
      approved: false,
    };

    const deadline = parseDate(req.body.deadline);
    if (deadline) payload.deadline = deadline;

    if (!payload.title || !payload.category || !payload.location || !payload.type) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, location, and job type are required.',
      });
    }

    if (req.user) {
      payload.postedBy = req.user._id;
      payload.postedByName = req.user.fullName || req.user.username || req.user.email;
    }

    const created = await Job.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message,
    });
  }
};

exports.approveJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Job.findByIdAndUpdate(
      id,
      {
        approved: true,
        approvedAt: new Date(),
        approvedBy: req.user?._id,
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve job',
      error: error.message,
    });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Job.findByIdAndUpdate(
      id,
      {
        approved: false,
        active: false,
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject job',
      error: error.message,
    });
  }
};
