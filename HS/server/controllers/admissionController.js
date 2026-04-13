// server/controllers/admissionController.js
const Admission = require('../models/Admission');
const Appointment = require('../models/Appointment');

const normalizeVisitType = (visitType) => {
  if (!visitType) return undefined;
  const value = String(visitType).trim().toLowerCase();
  if (value === 'opd') return 'OPD';
  if (value === 'ipd') return 'IPD';
  if (value === 'emergency') return 'Emergency';
  return visitType;
};

exports.getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find()
      .sort({ admissionDate: -1 })
      .populate({
        path: 'visitId',
        populate: [
          { path: 'patient', populate: { path: 'user', select: 'name' } },
          { path: 'doctor', populate: { path: 'user', select: 'name' } },
        ],
      });

    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAdmission = async (req, res) => {
  try {
    const { visitId, roomType, roomNumber, bedNumber, admissionDate, dischargeDate, notes } = req.body;
    if (!visitId) return res.status(400).json({ message: 'visitId is required' });
    if (!roomType) return res.status(400).json({ message: 'roomType is required' });
    if (!roomNumber) return res.status(400).json({ message: 'roomNumber is required' });
    if (!bedNumber) return res.status(400).json({ message: 'bedNumber is required' });

    const appointment = await Appointment.findById(visitId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const normalizedStatus = String(appointment.status || '').trim().toLowerCase();
    if (normalizedStatus !== 'admitted') {
      return res.status(400).json({ message: 'Admission can be created only for admitted appointments' });
    }

    const normalizedVisitType = normalizeVisitType(appointment.visitType);
    if (normalizedVisitType !== 'IPD') {
      return res.status(400).json({ message: 'Admission is allowed only for IPD visits' });
    }

    const existing = await Admission.findOne({ visitId });
    if (existing) return res.json(existing);

    const admission = await Admission.create({
      visitId,
      roomType,
      roomNumber,
      bedNumber,
      admissionDate: admissionDate || new Date(),
      dischargeDate,
      notes,
    });

    res.status(201).json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAdmission = async (req, res) => {
  try {
    const { roomType, roomNumber, bedNumber, notes } = req.body;
    if (!roomType) return res.status(400).json({ message: 'roomType is required' });
    if (!roomNumber) return res.status(400).json({ message: 'roomNumber is required' });
    if (!bedNumber) return res.status(400).json({ message: 'bedNumber is required' });

    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });

    admission.roomType = roomType;
    admission.roomNumber = roomNumber;
    admission.bedNumber = bedNumber;
    if (notes !== undefined) admission.notes = notes;

    await admission.save();
    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.dischargeAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });

    admission.dischargeDate = req.body.dischargeDate || new Date();
    if (req.body.notes) admission.notes = req.body.notes;
    admission.status = 'discharged';
    await admission.save();

    await Appointment.findByIdAndUpdate(admission.visitId, { status: 'discharged' });

    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
