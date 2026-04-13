// server/controllers/patientController.js
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const User = require('../models/User');

exports.createPatient = async (req, res) => {
  const { name, email, password, age, gender, contact, address, medicalHistory } = req.body;
  try {
    const user = await User.create({ name, email, password, role: 'Patient' });
    const patient = await Patient.create({ 
      user: user._id, age, gender, contact, address, medicalHistory 
    });
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate('user', 'name email');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    if (req.body.name) patient.user.name = req.body.name;
    if (req.body.email) patient.user.email = req.body.email;
    if (req.body.password) patient.user.password = req.body.password;
    await patient.user.save();

    ['age', 'gender', 'contact', 'address', 'medicalHistory'].forEach((field) => {
      if (req.body[field] !== undefined) patient[field] = req.body[field];
    });

    await patient.save();
    const populated = await patient.populate('user', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid patient id' });
    }
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    // Remove linked user if it still exists
    if (patient.user) {
      await User.findByIdAndDelete(patient.user).catch(() => {});
    }
    await patient.deleteOne();
    
    res.json({ message: 'Patient removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
