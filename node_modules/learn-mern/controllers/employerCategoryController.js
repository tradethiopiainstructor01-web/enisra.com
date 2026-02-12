const EmployerCategory = require('../models/EmployerCategory');

const toTrimmedString = (value) => (value || '').toString().trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listEmployerCategories = async (req, res) => {
  try {
    const activeOnly = req.query.active !== 'false';
    const filter = activeOnly ? { active: true } : {};

    const categories = await EmployerCategory.find(filter)
      .sort({ name: 1 })
      .lean();

    return res.json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employer categories',
      error: error.message,
    });
  }
};

const createEmployerCategory = async (req, res) => {
  try {
    const name = toTrimmedString(req.body?.name);
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const existing = await EmployerCategory.findOne({
      name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
    }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Category already exists.' });
    }

    const created = await EmployerCategory.create({
      name,
      createdBy: req.user?._id,
      active: true,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category already exists.' });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create employer category',
      error: error.message,
    });
  }
};

const updateEmployerCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const name = req.body?.name !== undefined ? toTrimmedString(req.body.name) : undefined;
    const active = req.body?.active;

    const update = {};
    if (name !== undefined) {
      if (!name) {
        return res.status(400).json({ success: false, message: 'Category name cannot be empty.' });
      }

      const existing = await EmployerCategory.findOne({
        name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
      }).lean();
      if (existing && existing._id?.toString?.() !== id) {
        return res.status(409).json({ success: false, message: 'Category already exists.' });
      }

      update.name = name;
    }
    if (active !== undefined) {
      update.active = Boolean(active);
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ success: false, message: 'No changes provided.' });
    }

    const updated = await EmployerCategory.findByIdAndUpdate(id, update, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category already exists.' });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to update employer category',
      error: error.message,
    });
  }
};

const deleteEmployerCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await EmployerCategory.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    return res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete employer category',
      error: error.message,
    });
  }
};

module.exports = {
  listEmployerCategories,
  createEmployerCategory,
  updateEmployerCategory,
  deleteEmployerCategory,
};
