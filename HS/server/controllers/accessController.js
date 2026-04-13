// server/controllers/accessController.js
const AccessSetting = require('../models/AccessSetting');
const Staff = require('../models/Staff');

const defaultAccess = {
  Admin: [
    '/dashboard',
    '/book-appointment',
    '/appointments',
    '/doctors',
    '/receptionists',
    '/patients',
    '/billing',
    '/reports',
    '/patient-reports',
    '/doctor-reports',
    '/billing-reports',
    '/appointment-reports',
    '/staff-reports',
    '/staff',
    '/about',
    '/contact',
    '/business-settings',
  ],
  Doctor: ['/dashboard', '/appointments', '/patients', '/reports', '/patient-reports', '/doctor-reports', '/appointment-reports', '/about', '/contact'],
  Staff: ['/dashboard', '/appointments', '/patients', '/billing', '/about', '/contact', '/patient-reports', '/billing-reports', '/staff-reports', '/appointment-reports'],
  Receptionist: ['/dashboard', '/appointments', '/patients', '/billing', '/about', '/contact', '/receptionists', '/patient-reports', '/billing-reports', '/appointment-reports'],
  Patient: ['/dashboard', '/book-appointment', '/appointments', '/about', '/contact'],
};

const ensureDefaultForRole = async (role) => {
  let setting = await AccessSetting.findOne({ role });
  const defaults = defaultAccess[role] || [];
  if (!setting) {
    setting = await AccessSetting.create({ role, allowedRoutes: defaults });
    return setting;
  }
  // Auto-merge new default routes if the record is stale
  const current = new Set(setting.allowedRoutes || []);
  let updated = false;
  defaults.forEach((route) => {
    if (!current.has(route)) {
      current.add(route);
      updated = true;
    }
  });
  if (updated) {
    setting.allowedRoutes = Array.from(current);
    await setting.save();
  }
  return setting;
};

const resolveEffectiveRole = async (user) => {
  if (!user) return null;
  if (user.role === 'Staff') {
    const staffProfile = await Staff.findOne({ user: user._id }).select('role');
    if (staffProfile?.role === 'Receptionist') {
      return 'Receptionist';
    }
  }
  return user.role;
};

// GET /api/access/my - current user's allowed routes
exports.getMyAccess = async (req, res) => {
  try {
    const effectiveRole = await resolveEffectiveRole(req.user);
    const setting = await ensureDefaultForRole(effectiveRole);
    res.json({ role: effectiveRole, allowedRoutes: setting.allowedRoutes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/access - admin: list all role access settings
exports.getAccessSettings = async (req, res) => {
  try {
    const roles = Object.keys(defaultAccess);
    // ensure defaults exist
    await Promise.all(roles.map((r) => ensureDefaultForRole(r)));
    const settings = await AccessSetting.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/access/:role - admin: update allowed routes for role
exports.updateAccessSetting = async (req, res) => {
  try {
    const { role } = req.params;
    const { allowedRoutes } = req.body;
    if (!['Admin', 'Doctor', 'Staff', 'Receptionist', 'Patient'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const setting = await AccessSetting.findOneAndUpdate(
      { role },
      { allowedRoutes },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
