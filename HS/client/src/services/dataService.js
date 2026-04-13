// src/services/dataService.js
import api from './api';

// --- DOCTORS ---
const getDoctors = async () => (await api.get('/doctors')).data;
const createDoctor = async (doctorData) => (await api.post('/doctors', doctorData)).data;
const updateDoctor = async (id, doctorData) => (await api.put(`/doctors/${id}`, doctorData)).data;
const deleteDoctor = async (id) => (await api.delete(`/doctors/${id}`)).data;

// --- PATIENTS ---
const getPatients = async () => (await api.get('/patients')).data;
const createPatient = async (patientData) => (await api.post('/patients', patientData)).data;
const updatePatient = async (id, patientData) => (await api.put(`/patients/${id}`, patientData)).data;
const deletePatient = async (id) => (await api.delete(`/patients/${id}`)).data;

// --- APPOINTMENTS ---
const getAppointments = async () => (await api.get('/appointments')).data;
const getAppointmentsByPatient = async (id) => (await api.get(`/appointments/patient/${id}`)).data;
const createAppointment = async (appointmentData) => (await api.post('/appointments', appointmentData)).data;
const updateAppointment = async (id, appointmentData) => (await api.put(`/appointments/${id}`, appointmentData)).data;
const updateAppointmentStatus = async (id, statusData) => (await api.put(`/appointments/${id}/status`, statusData)).data;
const deleteAppointment = async (id) => (await api.delete(`/appointments/${id}`)).data;

// --- ADMISSIONS ---
const getAdmissions = async () => (await api.get('/admissions')).data;
const createAdmission = async (admissionData) => (await api.post('/admissions', admissionData)).data;
const updateAdmission = async (id, admissionData) => (await api.put(`/admissions/${id}`, admissionData)).data;
const dischargeAdmission = async (id, dischargeData) => (await api.put(`/admissions/${id}/discharge`, dischargeData)).data;

// --- STAFF ---
const getStaff = async () => (await api.get('/staff')).data;
const createStaff = async (staffData) => (await api.post('/staff', staffData)).data;
const updateStaff = async (id, staffData) => (await api.put(`/staff/${id}`, staffData)).data;
const deleteStaff = async (id) => (await api.delete(`/staff/${id}`)).data;

// --- BILLING ---
const getBills = async () => (await api.get('/billing')).data;
const createBill = async (billData) => (await api.post('/billing', billData)).data;
const updateBill = async (id, billData) => (await api.put(`/billing/${id}`, billData)).data;
const deleteBill = async (id) => (await api.delete(`/billing/${id}`)).data;

// --- REPORTS / DASHBOARD ---
const getStats = async () => (await api.get('/admin/dashboard')).data;
const getReportSummary = async () => (await api.get('/reports/summary')).data;
const getPatientReport = async (filters = {}) => (await api.get('/reports/patients', { params: filters })).data;
const getPatientDetailReport = async (id) => (await api.get(`/reports/patients/${id}`)).data;
const getDoctorReport = async (filters = {}) => (await api.get('/reports/doctors', { params: filters })).data;
const getDoctorDetailReport = async (id) => (await api.get(`/reports/doctors/${id}`)).data;
const getBillingReport = async (filters = {}) => (await api.get('/reports/billing', { params: filters })).data;
const getBillingDetailReport = async (id) => (await api.get(`/reports/billing/${id}`)).data;
const getAppointmentReport = async (filters = {}) => (await api.get('/reports/appointments', { params: filters })).data;
const getAppointmentDetailReport = async (id) => (await api.get(`/reports/appointments/${id}`)).data;
const getStaffReport = async (filters = {}) => (await api.get('/reports/staff', { params: filters })).data;
const getStaffDetailReport = async (id) => (await api.get(`/reports/staff/${id}`)).data;

export default {
  // Doctors
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  // Patients
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  // Appointments
  getAppointments,
  getAppointmentsByPatient,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  // Admissions
  getAdmissions,
  createAdmission,
  updateAdmission,
  dischargeAdmission,
  // Staff
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  // Billing
  getBills,
  createBill,
  updateBill,
  deleteBill,
  // Reports
  getStats,
  getReportSummary,
  getPatientReport,
  getPatientDetailReport,
  getDoctorReport,
  getDoctorDetailReport,
  getBillingReport,
  getBillingDetailReport,
  getAppointmentReport,
  getAppointmentDetailReport,
  getStaffReport,
  getStaffDetailReport,
};
