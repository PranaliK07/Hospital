// server/controllers/doctorController.js
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Create Doctor (Admin only)
exports.createDoctor = async (req, res) => {
  const { name, email, password, specialty, experience } = req.body;
  try {
    // 1. Create User
    const user = await User.create({ name, email, password, role: 'Doctor' });
    
    // 2. Create Doctor Profile
    const doctor = await Doctor.create({ 
      user: user._id, 
      specialty, 
      experience 
    });

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Doctor
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Update linked user fields
    if (req.body.name) doctor.user.name = req.body.name;
    if (req.body.email) doctor.user.email = req.body.email;
    if (req.body.password) doctor.user.password = req.body.password;
    await doctor.user.save();

    // Update doctor profile
    ['specialty', 'experience', 'availability', 'fees'].forEach((field) => {
      if (req.body[field] !== undefined) doctor[field] = req.body[field];
    });

    await doctor.save();
    const populated = await doctor.populate('user', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    await User.findByIdAndDelete(doctor.user); // Delete associated user
    await doctor.remove();
    
    res.json({ message: 'Doctor removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
