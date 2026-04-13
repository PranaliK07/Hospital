// server/controllers/adminController.js
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');

exports.getDashboardStats = async (req, res) => {
  try {
    const patientCount = await Patient.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const appointmentCount = await Appointment.countDocuments();

    const revenueAgg = await Billing.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const revenue = revenueAgg[0]?.total || 0;

    res.json({
      patients: patientCount,
      doctors: doctorCount,
      appointments: appointmentCount,
      revenue,
      dashboardRole: req.user?.role || 'User',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
