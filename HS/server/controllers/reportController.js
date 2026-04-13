// server/controllers/reportController.js
const Appointment = require('../models/Appointment');
const Admission = require('../models/Admission');
const Billing = require('../models/Billing');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');

const parseDateRange = (req) => {
  const { from, to } = req.query || {};
  if (!from && !to) return null;

  const start = from ? new Date(from) : null;
  const end = to ? new Date(to) : null;

  if (start && Number.isNaN(start.getTime())) return { error: 'Invalid from date' };
  if (end && Number.isNaN(end.getTime())) return { error: 'Invalid to date' };

  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(23, 59, 59, 999);

  if (start && end && start > end) return { error: 'From date must be before To date' };

  return { start, end };
};

const buildRangeFilter = (field, range) => {
  if (!range) return null;
  const { start, end } = range;
  const filter = {};
  if (start) filter.$gte = start;
  if (end) filter.$lte = end;
  if (!Object.keys(filter).length) return null;
  return { [field]: filter };
};

const normalizeAppointmentStatus = (status) => {
  if (!status) return '';
  const value = String(status).trim().toLowerCase();
  if (value === 'cancelled') return 'canceled';
  return value;
};

const derivePatientStatusFromAppointment = (appointment) => {
  if (!appointment) return 'Outpatient';
  const status = normalizeAppointmentStatus(appointment.status);
  const visitType = appointment.visitType || 'OPD';
  if (status === 'admitted') return 'Admitted';
  if (status === 'discharged') return 'Discharged';
  if (visitType === 'IPD') return 'Admitted';
  return 'Outpatient';
};

exports.getSummary = async (req, res) => {
  try {
    // Aggregate data for reports
    const totalPatients = await Patient.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const statusCounts = await Patient.aggregate([
      {
        $lookup: {
          from: 'appointments',
          let: { patientId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$patient', '$$patientId'] } } },
            { $sort: { date: -1, createdAt: -1 } },
            { $limit: 1 },
            { $project: { status: 1, visitType: 1 } },
          ],
          as: 'latestAppointment',
        },
      },
      { $addFields: { latestAppointment: { $arrayElemAt: ['$latestAppointment', 0] } } },
      {
        $lookup: {
          from: 'admissions',
          let: { visitId: '$latestAppointment._id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$visitId', '$$visitId'] } } },
            { $sort: { admissionDate: -1, createdAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 0,
                roomType: 1,
                roomNumber: 1,
                bedNumber: 1,
                admissionDate: 1,
                dischargeDate: 1,
                notes: 1,
                status: 1,
              },
            },
          ],
          as: 'latestAdmission',
        },
      },
      { $addFields: { latestAdmission: { $arrayElemAt: ['$latestAdmission', 0] } } },
      {
        $addFields: {
          derivedStatus: {
            $switch: {
              branches: [
                {
                  case: { $eq: [{ $toLower: '$latestAppointment.status' }, 'admitted'] },
                  then: 'Admitted',
                },
                {
                  case: { $eq: [{ $toLower: '$latestAppointment.status' }, 'discharged'] },
                  then: 'Discharged',
                },
                { case: { $eq: ['$latestAppointment.visitType', 'IPD'] }, then: 'Admitted' },
              ],
              default: 'Outpatient',
            },
          },
        },
      },
      { $group: { _id: '$derivedStatus', total: { $sum: 1 } } },
    ]);

    const admitted = statusCounts.find((item) => item._id === 'Admitted')?.total || 0;
    const discharged = statusCounts.find((item) => item._id === 'Discharged')?.total || 0;
    const outpatient = statusCounts.find((item) => item._id === 'Outpatient')?.total || 0;

    const bills = await Billing.find({ status: 'Paid' });
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.amount, 0);

    // Doctor workload (appointments per doctor)
    const doctorLoads = await Appointment.aggregate([
      { $group: { _id: '$doctor', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);
    const doctorLookup = await Doctor.find({ _id: { $in: doctorLoads.map((d) => d._id) } }).populate('user', 'name');
    const doctorStats = doctorLoads.map((d) => {
      const doc = doctorLookup.find((x) => x._id.toString() === d._id.toString());
      return { doctor: doc?.user?.name || 'N/A', total: d.total };
    });

    res.json({ totalPatients, totalAppointments, totalRevenue, admitted, discharged, outpatient, doctorStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patient status detailed list
exports.getPatientStatusReport = async (req, res) => {
  try {
    const range = parseDateRange(req);
    if (range?.error) return res.status(400).json({ message: range.error });
    const patientDateFilter = buildRangeFilter('createdAt', range);

    const report = await Patient.aggregate([
      ...(patientDateFilter ? [{ $match: patientDateFilter }] : []),
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData',
        },
      },
      { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'appointments',
          let: { patientId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$patient', '$$patientId'] } } },
            { $sort: { date: -1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: 'doctors',
                localField: 'doctor',
                foreignField: '_id',
                as: 'doctorData',
              },
            },
            { $unwind: { path: '$doctorData', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'users',
                localField: 'doctorData.user',
                foreignField: '_id',
                as: 'doctorUserData',
              },
            },
            { $unwind: { path: '$doctorUserData', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                date: 1,
                status: 1,
                visitType: 1,
                updatedAt: 1,
                doctorName: '$doctorUserData.name',
                doctorEmail: '$doctorUserData.email',
              },
            },
          ],
          as: 'latestAppointment',
        },
      },
      { $addFields: { latestAppointment: { $arrayElemAt: ['$latestAppointment', 0] } } },
      {
        $lookup: {
          from: 'admissions',
          let: { visitId: '$latestAppointment._id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$visitId', '$$visitId'] } } },
            { $sort: { admissionDate: -1, createdAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 0,
                roomType: 1,
                roomNumber: 1,
                bedNumber: 1,
                admissionDate: 1,
                dischargeDate: 1,
                notes: 1,
                status: 1,
              },
            },
          ],
          as: 'latestAdmission',
        },
      },
      { $addFields: { latestAdmission: { $arrayElemAt: ['$latestAdmission', 0] } } },
      {
        $addFields: {
          derivedStatus: {
            $switch: {
              branches: [
                {
                  case: { $eq: [{ $toLower: '$latestAppointment.status' }, 'admitted'] },
                  then: 'Admitted',
                },
                {
                  case: { $eq: [{ $toLower: '$latestAppointment.status' }, 'discharged'] },
                  then: 'Discharged',
                },
                { case: { $eq: ['$latestAppointment.visitType', 'IPD'] }, then: 'Admitted' },
              ],
              default: 'Outpatient',
            },
          },
        },
      },
      {
        $project: {
          id: '$_id',
          status: '$derivedStatus',
          age: 1,
          gender: 1,
          contact: 1,
          address: 1,
          medicalHistory: 1,
          admittedAt: {
            $ifNull: ['$latestAdmission.admissionDate', { $ifNull: ['$latestAppointment.date', '$createdAt'] }],
          },
          dischargedAt: { $ifNull: ['$latestAdmission.dischargeDate', '$latestAppointment.updatedAt'] },
          updatedAt: {
            $ifNull: ['$latestAdmission.dischargeDate', { $ifNull: ['$latestAppointment.updatedAt', '$updatedAt'] }],
          },
          name: { $ifNull: ['$userData.name', 'N/A'] },
          email: { $ifNull: ['$userData.email', ''] },
          doctor: { $ifNull: ['$latestAppointment.doctorName', 'Unassigned'] },
          doctorEmail: { $ifNull: ['$latestAppointment.doctorEmail', ''] },
          lastVisit: '$latestAppointment.date',
          roomType: { $ifNull: ['$latestAdmission.roomType', ''] },
          roomNumber: { $ifNull: ['$latestAdmission.roomNumber', ''] },
          bedNumber: { $ifNull: ['$latestAdmission.bedNumber', ''] },
          admissionStatus: { $ifNull: ['$latestAdmission.status', ''] },
        },
      },
      {
        $group: {
          _id: '$status',
          patients: { $push: '$$ROOT' },
        },
      },
    ]);

    const grouped = { admitted: [], discharged: [], outpatient: [] };
    report.forEach((item) => {
      if (item._id === 'Discharged') grouped.discharged = item.patients;
      else if (item._id === 'Outpatient') grouped.outpatient = item.patients;
      else grouped.admitted = item.patients;
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Detailed patient report
exports.getPatientDetailReport = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', 'name email');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const appointments = await Appointment.find({ patient: patient._id })
      .sort({ date: -1 })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } });

    const bills = await Billing.find({ patient: patient._id }).sort({ createdAt: -1 });
    const admissions = await Admission.find({ visitId: { $in: appointments.map((appointment) => appointment._id) } })
      .sort({ admissionDate: -1 });
    const latestAppointment = appointments[0];
    const derivedStatus = derivePatientStatusFromAppointment(latestAppointment);
    const admissionMap = admissions.reduce((acc, admission) => {
      acc[admission.visitId.toString()] = admission;
      return acc;
    }, {});
    const latestAdmission = latestAppointment ? admissionMap[latestAppointment._id.toString()] : null;

    res.json({
      patient: {
        id: patient._id,
        name: patient.user?.name,
        email: patient.user?.email,
        age: patient.age,
        gender: patient.gender,
        contact: patient.contact,
        address: patient.address,
        status: derivedStatus,
        medicalHistory: patient.medicalHistory,
        createdAt: patient.createdAt,
        updatedAt: latestAppointment?.updatedAt || patient.updatedAt,
        admission: latestAdmission
          ? {
              roomType: latestAdmission.roomType,
              roomNumber: latestAdmission.roomNumber,
              bedNumber: latestAdmission.bedNumber,
              admissionDate: latestAdmission.admissionDate,
              dischargeDate: latestAdmission.dischargeDate,
              status: latestAdmission.status,
              notes: latestAdmission.notes,
            }
          : null,
      },
      appointments: appointments.map((a) => ({
        id: a._id,
        doctor: a.doctor?.user?.name || 'N/A',
        doctorEmail: a.doctor?.user?.email || '',
        date: a.date,
        time: a.time,
        status: a.status,
        visitType: a.visitType,
        symptoms: a.symptoms,
        roomType: admissionMap[a._id.toString()]?.roomType || '',
        roomNumber: admissionMap[a._id.toString()]?.roomNumber || '',
        bedNumber: admissionMap[a._id.toString()]?.bedNumber || '',
        admissionDate: admissionMap[a._id.toString()]?.admissionDate || null,
        dischargeDate: admissionMap[a._id.toString()]?.dischargeDate || null,
      })),
      bills: bills.map((b) => ({
        id: b._id,
        amount: b.amount,
        status: b.status,
        description: b.description,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorReport = async (req, res) => {
  try {
    const range = parseDateRange(req);
    if (range?.error) return res.status(400).json({ message: range.error });
    const apptDateFilter = buildRangeFilter('date', range);

    const doctors = await Doctor.find().populate('user', 'name email');
    const doctorIds = doctors.map((doctor) => doctor._id);

    const appointmentStats = await Appointment.aggregate([
      {
        $match: {
          doctor: { $in: doctorIds },
          ...(apptDateFilter || {}),
        },
      },
      {
        $group: {
          _id: '$doctor',
          totalAppointments: { $sum: 1 },
          patientsSet: { $addToSet: '$patient' },
        },
      },
      {
        $project: {
          totalAppointments: 1,
          patientsHandled: { $size: '$patientsSet' },
        },
      },
    ]);

    const revenueStats = await Billing.aggregate([
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointment',
          foreignField: '_id',
          as: 'appointmentData',
        },
      },
      { $unwind: { path: '$appointmentData', preserveNullAndEmptyArrays: false } },
      {
        $match: {
          'appointmentData.doctor': { $in: doctorIds },
          status: 'Paid',
          ...(apptDateFilter
            ? { 'appointmentData.date': apptDateFilter.date }
            : {}),
        },
      },
      {
        $group: {
          _id: '$appointmentData.doctor',
          revenueGenerated: { $sum: '$amount' },
        },
      },
    ]);

    const appointmentMap = appointmentStats.reduce((acc, item) => {
      acc[item._id.toString()] = item;
      return acc;
    }, {});

    const revenueMap = revenueStats.reduce((acc, item) => {
      acc[item._id.toString()] = item.revenueGenerated;
      return acc;
    }, {});

    const report = doctors.map((doctor) => {
      const id = doctor._id.toString();
      const appt = appointmentMap[id] || { totalAppointments: 0, patientsHandled: 0 };
      return {
        id: doctor._id,
        name: doctor.user?.name || 'N/A',
        email: doctor.user?.email || 'N/A',
        specialization: doctor.specialty || 'N/A',
        totalAppointments: appt.totalAppointments,
        patientsHandled: appt.patientsHandled,
        revenueGenerated: revenueMap[id] || 0,
      };
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorDetailReport = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const appointmentHistory = await Appointment.find({ doctor: doctor._id })
      .sort({ date: -1 })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } });

    const appointmentIds = appointmentHistory.map((appointment) => appointment._id);
    const bills = await Billing.find({ appointment: { $in: appointmentIds } }).sort({ createdAt: -1 });
    const revenueGenerated = bills
      .filter((bill) => bill.status === 'Paid')
      .reduce((sum, bill) => sum + bill.amount, 0);

    const patientsHandled = new Set(
      appointmentHistory
        .map((appointment) => appointment.patient?._id?.toString())
        .filter(Boolean)
    ).size;

    res.json({
      doctor: {
        id: doctor._id,
        name: doctor.user?.name || 'N/A',
        email: doctor.user?.email || 'N/A',
        specialization: doctor.specialty || 'N/A',
        experience: doctor.experience ?? 0,
        availability: doctor.availability || 'N/A',
        fees: doctor.fees ?? 0,
      },
      stats: {
        totalAppointments: appointmentHistory.length,
        patientsHandled,
        revenueGenerated,
      },
      appointments: appointmentHistory.map((appointment) => ({
        id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        symptoms: appointment.symptoms,
        patientName: appointment.patient?.user?.name || 'N/A',
        patientEmail: appointment.patient?.user?.email || 'N/A',
      })),
      bills: bills.map((bill) => ({
        id: bill._id,
        amount: bill.amount,
        status: bill.status,
        description: bill.description,
        createdAt: bill.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBillingReport = async (req, res) => {
  try {
    const range = parseDateRange(req);
    if (range?.error) return res.status(400).json({ message: range.error });
    const billingDateFilter = buildRangeFilter('createdAt', range);

    const bills = await Billing.find(billingDateFilter || {})
      .sort({ createdAt: -1 })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .populate({
        path: 'appointment',
        select: 'doctor date time status',
        populate: { path: 'doctor', populate: { path: 'user', select: 'name email' } },
      });

    const report = bills.map((bill) => ({
      id: bill._id,
      patientId: bill.patient?._id,
      patientName: bill.patient?.user?.name || 'N/A',
      patientEmail: bill.patient?.user?.email || 'N/A',
      amount: bill.amount,
      status: bill.status,
      description: bill.description,
      billingDate: bill.createdAt,
      appointmentId: bill.appointment?._id || null,
      doctorName: bill.appointment?.doctor?.user?.name || 'N/A',
      doctorEmail: bill.appointment?.doctor?.user?.email || 'N/A',
      appointmentDate: bill.appointment?.date || null,
      appointmentTime: bill.appointment?.time || null,
    }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBillingDetailReport = async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .populate({
        path: 'appointment',
        populate: [
          { path: 'doctor', populate: { path: 'user', select: 'name email' } },
          { path: 'patient', populate: { path: 'user', select: 'name email' } },
        ],
      });

    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    res.json({
      billing: {
        id: bill._id,
        amount: bill.amount,
        status: bill.status,
        description: bill.description,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
      },
      patient: {
        id: bill.patient?._id || bill.appointment?.patient?._id || null,
        name: bill.patient?.user?.name || bill.appointment?.patient?.user?.name || 'N/A',
        email: bill.patient?.user?.email || bill.appointment?.patient?.user?.email || 'N/A',
      },
      appointment: bill.appointment
        ? {
            id: bill.appointment._id,
            date: bill.appointment.date,
            time: bill.appointment.time,
            status: bill.appointment.status,
            doctorName: bill.appointment.doctor?.user?.name || 'N/A',
            doctorEmail: bill.appointment.doctor?.user?.email || 'N/A',
          }
        : null,
      paymentHistory: [
        {
          status: bill.status,
          amount: bill.amount,
          date: bill.updatedAt || bill.createdAt,
          note: bill.description || 'Billing record updated',
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppointmentReport = async (req, res) => {
  try {
    const range = parseDateRange(req);
    if (range?.error) return res.status(400).json({ message: range.error });
    const appointmentDateFilter = buildRangeFilter('date', range);

    const appointments = await Appointment.find(appointmentDateFilter || {})
      .sort({ date: -1 })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } });

    res.json(
      appointments.map((appointment) => ({
        id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        visitType: appointment.visitType,
        symptoms: appointment.symptoms,
        patientId: appointment.patient?._id || null,
        patientName: appointment.patient?.user?.name || 'N/A',
        patientEmail: appointment.patient?.user?.email || 'N/A',
        doctorId: appointment.doctor?._id || null,
        doctorName: appointment.doctor?.user?.name || 'N/A',
        doctorEmail: appointment.doctor?.user?.email || 'N/A',
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppointmentDetailReport = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const billingHistory = await Billing.find({ appointment: appointment._id }).sort({ createdAt: -1 });

    res.json({
      appointment: {
        id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        visitType: appointment.visitType,
        symptoms: appointment.symptoms,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
      },
      patient: {
        id: appointment.patient?._id || null,
        name: appointment.patient?.user?.name || 'N/A',
        email: appointment.patient?.user?.email || 'N/A',
      },
      doctor: {
        id: appointment.doctor?._id || null,
        name: appointment.doctor?.user?.name || 'N/A',
        email: appointment.doctor?.user?.email || 'N/A',
        specialization: appointment.doctor?.specialty || 'N/A',
      },
      billingHistory: billingHistory.map((bill) => ({
        id: bill._id,
        amount: bill.amount,
        status: bill.status,
        description: bill.description,
        createdAt: bill.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaffReport = async (req, res) => {
  try {
    const range = parseDateRange(req);
    if (range?.error) return res.status(400).json({ message: range.error });
    const staffDateFilter = buildRangeFilter('createdAt', range);

    const staffMembers = await Staff.find(staffDateFilter || {}).sort({ createdAt: -1 }).populate('user', 'name email');
    const roleGroup = await Staff.aggregate([
      { $group: { _id: '$role', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const report = staffMembers.map((staff) => ({
      id: staff._id,
      name: staff.user?.name || 'N/A',
      email: staff.user?.email || 'N/A',
      role: staff.role || 'N/A',
      department: staff.department || 'N/A',
      shift: staff.shift || 'N/A',
      assignedRecords: roleGroup.find((group) => group._id === staff.role)?.total || 0,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaffDetailReport = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('user', 'name email');
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    const roleBasedCount = await Staff.countDocuments({ role: staff.role });
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    res.json({
      staff: {
        id: staff._id,
        name: staff.user?.name || 'N/A',
        email: staff.user?.email || 'N/A',
        role: staff.role || 'N/A',
        department: staff.department || 'N/A',
        shift: staff.shift || 'N/A',
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
      },
      activity: {
        roleBasedCount,
        assignedRecords: roleBasedCount,
        recentAppointments: recentAppointments.map((appointment) => ({
          id: appointment._id,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
          patient: appointment.patient?.user?.name || 'N/A',
          doctor: appointment.doctor?.user?.name || 'N/A',
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
