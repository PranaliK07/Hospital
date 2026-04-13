// server/controllers/authController.js
const User = require('../models/User');
const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
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

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role });
    const effectiveRole = await resolveEffectiveRole(user);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: effectiveRole,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const effectiveRole = await resolveEffectiveRole(user);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
