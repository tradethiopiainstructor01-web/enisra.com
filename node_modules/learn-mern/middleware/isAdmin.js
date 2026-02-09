// Simple admin/COO role checker
module.exports = function isAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const role = (req.user.role || '').toString().toLowerCase();
  if (role === 'admin' || role === 'coo') return next();
  return res.status(403).json({ success: false, message: 'Admin/COO role required' });
};
