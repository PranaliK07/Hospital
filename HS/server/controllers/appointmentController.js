// server/controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Admission = require('../models/Admission');

const normalizeStatus = (status) => {
  if (!status) return undefined;
  const value = String(status).trim().toLowerCase();
  if (value === 'cancelled') return 'canceled';
  if (value === 'scheduled') return 'scheduled';
  if (value === 'ongoing') return 'ongoing';
  if (value === 'admitted') return 'admitted';
  if (value === 'completed') return 'completed';
  if (value === 'discharged') return 'discharged';
  if (value === 'canceled') return 'canceled';
  return value;
};

const normalizeVisitType = (visitType) => {
  if (!visitType) return undefined;
  const value = String(visitType).trim().toLowerCase();
  if (value === 'opd') return 'OPD';
  if (value === 'ipd') return 'IPD';
  if (value === 'emergency') return 'Emergency';
  return visitType;
};

const ALLOWED_STATUSES = new Set(['scheduled', 'ongoing', 'admitted', 'completed', 'discharged', 'canceled']);

exports.createAppointment = async (req, res) => {
  try {
    const payload = {
      patient: req.body.patient || req.body.patientId,
      doctor: req.body.doctor || req.body.doctorId,
      date: req.body.date,
      time: req.body.time,
      status: normalizeStatus(req.body.status) || 'scheduled',
      visitType: normalizeVisitType(req.body.visitType) || 'OPD',
      symptoms: req.body.symptoms || req.body.notes,
    };
    if (!payload.patient || !payload.doctor) {
      return res.status(400).json({ message: 'patient and doctor are required' });
    }
    if (!ALLOWED_STATUSES.has(payload.status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const appointment = await Appointment.create(payload);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    // Populate patient and doctor details
    const appointments = await Appointment.find()
      .populate({ path: 'patient', populate: { path: 'user', select: 'name' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const nextStatus = normalizeStatus(req.body.status);
    if (!nextStatus) return res.status(400).json({ message: 'Status is required' });
    if (!ALLOWED_STATUSES.has(nextStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (!appointment.visitType) appointment.visitType = 'OPD';
    if (req.body.visitType) {
      appointment.visitType = normalizeVisitType(req.body.visitType) || appointment.visitType;
    }

    let finalStatus = nextStatus;

    if (nextStatus === 'admitted') {
      appointment.visitType = 'IPD';
    }
    if (nextStatus === 'discharged') {
      appointment.visitType = 'IPD';
    }
    if (nextStatus === 'completed' && appointment.visitType === 'IPD') {
      finalStatus = 'discharged';
    }

    appointment.status = finalStatus;

    await appointment.save();

    if (finalStatus === 'admitted') {
      const existing = await Admission.findOne({ visitId: appointment._id });
      if (!existing) {
        if (!req.body.roomType || !req.body.roomNumber || !req.body.bedNumber) {
          return res.status(400).json({ message: 'roomType, roomNumber and bedNumber are required to admit an IPD visit' });
        }
        await Admission.create({
          visitId: appointment._id,
          roomType: req.body.roomType,
          roomNumber: req.body.roomNumber,
          bedNumber: req.body.bedNumber,
          admissionDate: req.body.admissionDate || new Date(),
          notes: req.body.notes,
        });
      }
    }

    if (finalStatus === 'discharged') {
      const admission = await Admission.findOne({ visitId: appointment._id });
      if (admission && !admission.dischargeDate) {
        admission.dischargeDate = req.body.dischargeDate || new Date();
        if (req.body.notes) admission.notes = req.body.notes;
        admission.status = 'discharged';
        await admission.save();
      }
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const update = {
      ...req.body,
    };

    if (req.body.patientId && !req.body.patient) update.patient = req.body.patientId;
    if (req.body.doctorId && !req.body.doctor) update.doctor = req.body.doctorId;
    if (req.body.notes && !req.body.symptoms) update.symptoms = req.body.notes;
    if (req.body.status) update.status = normalizeStatus(req.body.status);
    if (update.status && !ALLOWED_STATUSES.has(update.status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    if (req.body.visitType) update.visitType = normalizeVisitType(req.body.visitType);

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (update.status) {
      if (!appointment.visitType) appointment.visitType = 'OPD';
      let finalStatus = update.status;

      if (finalStatus === 'admitted' || finalStatus === 'discharged') {
        appointment.visitType = 'IPD';
      }
      if (finalStatus === 'completed' && appointment.visitType === 'IPD') {
        finalStatus = 'discharged';
      }

      appointment.status = finalStatus;
      await appointment.save();

      if (finalStatus === 'admitted') {
        const existing = await Admission.findOne({ visitId: appointment._id });
        if (!existing) {
          if (!req.body.roomType || !req.body.roomNumber || !req.body.bedNumber) {
            return res.status(400).json({ message: 'roomType, roomNumber and bedNumber are required to admit an IPD visit' });
          }
          await Admission.create({
            visitId: appointment._id,
            roomType: req.body.roomType,
            roomNumber: req.body.roomNumber,
            bedNumber: req.body.bedNumber,
            admissionDate: req.body.admissionDate || new Date(),
            notes: req.body.notes,
          });
        }
      }

      if (finalStatus === 'discharged') {
        const admission = await Admission.findOne({ visitId: appointment._id });
        if (admission && !admission.dischargeDate) {
          admission.dischargeDate = req.body.dischargeDate || new Date();
          if (req.body.notes) admission.notes = req.body.notes;
          admission.status = 'discharged';
          await admission.save();
        }
      }
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    await Admission.deleteMany({ visitId: appointment._id });
    await Appointment.findByIdAndDelete(appointment._id);

    res.json({ message: 'Appointment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppointmentsByPatient = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.params.id })
      .sort({ date: -1 })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
