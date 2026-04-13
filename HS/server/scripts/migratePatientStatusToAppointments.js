// server/scripts/migratePatientStatusToAppointments.js
require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

const mapStatusToAppointment = (status) => {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'admitted') {
    return { status: 'admitted', visitType: 'IPD' };
  }
  if (value === 'discharged') {
    return { status: 'discharged', visitType: 'IPD' };
  }
  if (value === 'outpatient') {
    return { status: 'completed', visitType: 'OPD' };
  }
  return { status: 'completed', visitType: 'OPD' };
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const patients = await Patient.find({ status: { $exists: true } });
    let created = 0;
    let updated = 0;

    for (const patient of patients) {
      const hasAppointment = await Appointment.findOne({ patient: patient._id });
      if (!hasAppointment) {
        const mapping = mapStatusToAppointment(patient.status);
        const date = patient.createdAt || new Date();
        await Appointment.create({
          patient: patient._id,
          doctor: null,
          date,
          time: '00:00',
          status: mapping.status,
          visitType: mapping.visitType,
          symptoms: 'Migrated from patient status',
        });
        created += 1;
      }

      await Patient.updateOne({ _id: patient._id }, { $unset: { status: '' } });
      updated += 1;
    }

    console.log(`Migration complete. Patients updated: ${updated}. Appointments created: ${created}.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

run();
