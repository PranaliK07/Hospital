// server/controllers/staffController.js
const Staff = require('../models/Staff');
const User = require('../models/User');

exports.createStaff = async (req, res) => {
  const { name, email, password, role, department, shift } = req.body;
  try {
    const userRole = role === 'Receptionist' ? 'Receptionist' : 'Staff';
    const user = await User.create({ name, email, password, role: userRole });
    const staff = await Staff.create({ 
      user: user._id, role, department, shift 
    });
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().populate('user', 'name email');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('user');
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    if (req.body.name) staff.user.name = req.body.name;
    if (req.body.email) staff.user.email = req.body.email;
    if (req.body.password) staff.user.password = req.body.password;
    if (req.body.role !== undefined) {
      staff.user.role = req.body.role === 'Receptionist' ? 'Receptionist' : 'Staff';
    }
    await staff.user.save();

    ['role', 'department', 'shift'].forEach((field) => {
      if (req.body[field] !== undefined) staff[field] = req.body[field];
    });

    await staff.save();
    const populated = await staff.populate('user', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    
    await User.findByIdAndDelete(staff.user);
    await staff.remove();
    
    res.json({ message: 'Staff removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
