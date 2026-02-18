const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

const toTrimmedString = (value) => (value || '').toString().trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

const parseDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const extractEmail = (value) => {
  const candidate = toTrimmedString(value)
    .replace(/^mailto:/i, '')
    .split('?')[0];
  const match = candidate.match(EMAIL_REGEX);
  return match ? match[0].toLowerCase() : '';
};

const normalizeJobForResponse = (job) => {
  if (!job || typeof job !== 'object') return job;

  const postedByObject =
    job.postedBy && typeof job.postedBy === 'object' && !Array.isArray(job.postedBy)
      ? job.postedBy
      : null;
  const postedById = postedByObject && postedByObject._id ? postedByObject._id : job.postedBy;
  const postedByEmail = postedByObject ? extractEmail(postedByObject.email) : '';

  return {
    ...job,
    postedBy: postedById,
    company: toTrimmedString(job.company || job.companyName || job.postedByName),
    companyAddress: toTrimmedString(job.companyAddress || job.company_address),
    contactEmail: extractEmail(
      job.contactEmail || job.contact_email || job.email || postedByEmail || job.postedByName
    ),
  };
};

const normalizeJobsForResponse = (jobs) => (Array.isArray(jobs) ? jobs.map(normalizeJobForResponse) : []);

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
        { company: qRegex },
        { companyAddress: qRegex },
        { category: qRegex },
        { location: qRegex },
        { address: qRegex },
        { type: qRegex },
      ];
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'email')
        .sort({ postedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Job.countDocuments(filter),
    ]);
    const normalizedJobs = normalizeJobsForResponse(jobs);

    res.json({
      success: true,
      data: normalizedJobs,
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
      .populate('postedBy', 'email')
      .sort({ postedAt: -1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: normalizeJobsForResponse(jobs) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending jobs',
      error: error.message,
    });
  }
};

exports.listMyJobs = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { approved, active } = req.query;
    const filter = { postedBy: req.user._id };

    if (approved === 'true') filter.approved = true;
    if (approved === 'false') filter.approved = false;

    if (active === 'true') filter.active = true;
    if (active === 'false') filter.active = false;

    const jobs = await Job.find(filter)
      .populate('postedBy', 'email')
      .sort({ postedAt: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, data: normalizeJobsForResponse(jobs) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employer jobs',
      error: error.message,
    });
  }
};

exports.createJob = async (req, res) => {
  try {
    const payload = {
      title: toTrimmedString(req.body.title),
      department: toTrimmedString(req.body.department),
      company: toTrimmedString(req.body.company || req.body.companyName),
      companyAddress: toTrimmedString(req.body.companyAddress || req.body.company_address),
      contactEmail: extractEmail(req.body.contactEmail || req.body.contact_email || req.body.email),
      category: toTrimmedString(req.body.category),
      location: toTrimmedString(req.body.location),
      address: toTrimmedString(req.body.address),
      type: toTrimmedString(req.body.type),
      salary: toTrimmedString(req.body.salary),
      description: toTrimmedString(req.body.description),
      flow: toTrimmedString(req.body.flow),
      approved: false,
    };

    const deadline = parseDate(req.body.deadline);
    if (deadline) payload.deadline = deadline;
    
    const expirationDate = parseDate(req.body.expirationDate);
    if (expirationDate) payload.expirationDate = expirationDate;

    if (!payload.contactEmail && req.user?.email) {
      payload.contactEmail = extractEmail(req.user.email);
    }

    if (!payload.title || !payload.category || !payload.location || !payload.type || !payload.contactEmail) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, location, job type, and contact email are required.',
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

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const setPayload = {
      title: toTrimmedString(req.body.title),
      department: toTrimmedString(req.body.department),
      company: toTrimmedString(req.body.company || req.body.companyName),
      companyAddress: toTrimmedString(req.body.companyAddress || req.body.company_address),
      contactEmail: extractEmail(req.body.contactEmail || req.body.contact_email || req.body.email),
      category: toTrimmedString(req.body.category),
      location: toTrimmedString(req.body.location),
      address: toTrimmedString(req.body.address),
      type: toTrimmedString(req.body.type),
      salary: toTrimmedString(req.body.salary),
      description: toTrimmedString(req.body.description),
      flow: toTrimmedString(req.body.flow),
    };

    if (!setPayload.title || !setPayload.category || !setPayload.location || !setPayload.type || !setPayload.contactEmail) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, location, job type, and contact email are required.',
      });
    }

    const unsetPayload = {};
    if (Object.prototype.hasOwnProperty.call(req.body, 'deadline')) {
      const deadline = parseDate(req.body.deadline);
      if (req.body.deadline && !deadline) {
        return res.status(400).json({ success: false, message: 'Invalid deadline value.' });
      }
      if (deadline) {
        setPayload.deadline = deadline;
      } else {
        unsetPayload.deadline = 1;
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'expirationDate')) {
      const expirationDate = parseDate(req.body.expirationDate);
      if (req.body.expirationDate && !expirationDate) {
        return res.status(400).json({ success: false, message: 'Invalid expiration date value.' });
      }
      if (expirationDate) {
        setPayload.expirationDate = expirationDate;
      } else {
        unsetPayload.expirationDate = 1;
      }
    }

    const update = {
      $set: setPayload,
      ...(Object.keys(unsetPayload).length ? { $unset: unsetPayload } : {}),
    };

    const updated = await Job.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, data: normalizeJobForResponse(updated) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message,
    });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Job.findByIdAndUpdate(
      id,
      { active: false, approved: false },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, data: normalizeJobForResponse(updated) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message,
    });
  }
};

exports.applyToJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Check if user has employee role
    const userRole = (req.user.role || '').toString().toLowerCase();
    if (userRole !== 'employee') {
      return res.status(403).json({ success: false, message: 'Only employees can apply to jobs' });
    }

    // Require employee profile to be completed
    const infoStatus = (req.user.infoStatus || '').toString().toLowerCase();
    if (infoStatus !== 'completed') {
      return res.status(400).json({ success: false, message: 'Please complete your profile before applying.' });
    }

    const job = await Job.findById(id).lean();
    if (!job || !job.active || !job.approved) {
      return res.status(404).json({ success: false, message: 'Job not available' });
    }

    const existing = await Application.findOne({ job: id, applicant: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already applied to this job.' });
    }

    const created = await Application.create({
      job: id,
      applicant: req.user._id,
      employer: job.postedBy,
      status: 'applied',
    });

    // Notify employer if present
    if (job.postedBy) {
      await Notification.create({
        user: job.postedBy,
        text: `New application for ${job.title || 'a job posting'}`,
      });
    }

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    // Handle duplicate key error from unique index
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'You already applied to this job.' });
    }
    res.status(500).json({ success: false, message: 'Failed to apply to job', error: error.message });
  }
};
