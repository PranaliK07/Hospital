// src/data.js

export const initialPatients = [
  { id: 1, name: "John Doe", age: 34, gender: "Male", contact: "123-456-7890", disease: "Flu", doctor: "Dr. Smith", status: "Admitted" },
  { id: 2, name: "Jane Smith", age: 28, gender: "Female", contact: "987-654-3210", disease: "Fracture", doctor: "Dr. Adams", status: "Outpatient" },
  { id: 3, name: "Mike Johnson", age: 45, gender: "Male", contact: "555-123-4567", disease: "Cardiac Checkup", doctor: "Dr. Smith", status: "Discharged" },
];

export const initialDoctors = [
  { id: 1, name: "Dr. Alice Smith", specialty: "Cardiology", contact: "doc1@hms.com", availability: "Mon-Fri", patientsTreated: 120 },
  { id: 2, name: "Dr. Bob Adams", specialty: "Orthopedics", contact: "doc2@hms.com", availability: "Mon-Sat", patientsTreated: 85 },
  { id: 3, name: "Dr. Carol White", specialty: "Pediatrics", contact: "doc3@hms.com", availability: "Tue-Sat", patientsTreated: 200 },
];

export const initialStaff = [
  { id: 1, name: "Tom Hardy", role: "Nurse", contact: "nurse1@hms.com", shift: "Day" },
  { id: 2, name: "Lisa Ray", role: "Technician", contact: "tech1@hms.com", shift: "Night" },
];

export const initialAppointments = [
  { id: 1, patient: "John Doe", doctor: "Dr. Alice Smith", date: "2023-10-25", time: "10:00 AM", status: "Scheduled" },
  { id: 2, patient: "Jane Smith", doctor: "Dr. Bob Adams", date: "2023-10-25", time: "11:30 AM", status: "Completed" },
];

export const initialBilling = [
  { id: 1, patient: "John Doe", amount: 250, status: "Paid", date: "2023-10-20", service: "Consultation" },
  { id: 2, patient: "Jane Smith", amount: 1200, status: "Pending", date: "2023-10-22", service: "Surgery" },
];

export const initialUsers = [
  { id: 1, name: "admin", password: "admin123", role: "Admin", name: "System Admin" },
  { id: 2, name: "doctor", password: "doctor123", role: "Doctor", name: "Dr. Alice Smith" },
];

// Add this to src/data.js

export const initialReceptionists = [
  { id: 1, name: "Sarah Connor", email: "sarah@hms.com", phone: "555-0102", shift: "Morning" },
  { id: 2, name: "Mike Ross", email: "mike@hms.com", phone: "555-0103", shift: "Evening" },
];