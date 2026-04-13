// src/pages/Appointments.jsx
import React, { useEffect, useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import DataTable from '../components/Table';
import FormModal from '../components/FormModal';
import dataService from '../services/dataService';
import { normalizeStatus, normalizeVisitType, statusLabel, statusVariant } from '../utils/appointmentUtils';

const emptyAppointment = {
  id: null,
  patientId: '',
  doctorId: '',
  date: '',
  time: '',
  visitType: 'OPD',
  status: 'scheduled',
  symptoms: '',
};

const emptyAdmitDetails = {
  id: null,
  roomType: '',
  roomNumber: '',
  bedNumber: '',
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(emptyAppointment);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [admitData, setAdmitData] = useState(emptyAdmitDetails);

  useEffect(() => {
    const init = async () => {
      try {
        const [apps, pats, docs] = await Promise.all([
          dataService.getAppointments(),
          dataService.getPatients(),
          dataService.getDoctors(),
        ]);

        setPatients(pats);
        setDoctors(docs);
        setAppointments(
          apps.map((a) => ({
            id: a._id,
            patient: a.patient?.user?.name || 'N/A',
            doctor: a.doctor?.user?.name || 'N/A',
            patientId: a.patient?._id,
            doctorId: a.doctor?._id,
            date: a.date ? a.date.substring(0, 10) : '',
            time: a.time,
            visitType: normalizeVisitType(a.visitType),
            status: normalizeStatus(a.status) || 'scheduled',
            symptoms: a.symptoms || '',
          }))
        );
      } catch (err) {
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAdd = () => {
    setEditingData(emptyAppointment);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditingData({
      id: row.id,
      patientId: row.patientId,
      doctorId: row.doctorId,
      date: row.date,
      time: row.time,
      visitType: row.visitType,
      status: row.status,
      symptoms: row.symptoms,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await dataService.deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete appointment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        patient: editingData.patientId,
        doctor: editingData.doctorId,
        date: editingData.date,
        time: editingData.time,
        visitType: editingData.visitType,
        status: editingData.status,
        symptoms: editingData.symptoms,
      };

      if (editingData.id) {
        await dataService.updateAppointment(editingData.id, payload);
      } else {
        await dataService.createAppointment(payload);
      }
      setShowModal(false);
      // Refresh
      const refreshed = await dataService.getAppointments();
      setAppointments(
        refreshed.map((a) => ({
          id: a._id,
          patient: a.patient?.user?.name || 'N/A',
          doctor: a.doctor?.user?.name || 'N/A',
          patientId: a.patient?._id,
          doctorId: a.doctor?._id,
          date: a.date ? a.date.substring(0, 10) : '',
          time: a.time,
          visitType: normalizeVisitType(a.visitType),
          status: normalizeStatus(a.status) || 'scheduled',
          symptoms: a.symptoms || '',
        }))
      );
    } catch (err) {
      alert('Error saving appointment');
    }
  };

  const handleStatusAction = async (row, status) => {
    try {
      const updated = await dataService.updateAppointmentStatus(row.id, { status });
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                status: normalizeStatus(updated.status) || status,
                visitType: normalizeVisitType(updated.visitType),
              }
            : item
        )
      );
    } catch (err) {
      alert('Failed to update appointment status');
    }
  };

  const handleAdmit = (row) => {
    setAdmitData({ ...emptyAdmitDetails, id: row.id });
    setShowAdmitModal(true);
  };

  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        status: 'admitted',
        roomType: admitData.roomType,
        roomNumber: admitData.roomNumber,
        bedNumber: admitData.bedNumber,
      };
      const updated = await dataService.updateAppointmentStatus(admitData.id, payload);
      setShowAdmitModal(false);
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === admitData.id
            ? {
                ...item,
                status: normalizeStatus(updated.status) || 'admitted',
                visitType: normalizeVisitType(updated.visitType),
              }
            : item
        )
      );
    } catch (err) {
      alert('Failed to admit patient');
    }
  };

  const columns = [
    { label: 'Patient', field: 'patient' },
    { label: 'Doctor', field: 'doctor' },
    { label: 'Date', field: 'date' },
    { label: 'Time', field: 'time' },
    { label: 'Status', field: 'status', format: (value) => statusLabel(value), badgeVariant: (value) => statusVariant(value) },
  ];

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Appointment Scheduler</h4>
        <Button onClick={handleAdd}><FaPlus /> New Appointment</Button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={appointments} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        renderActions={(row) => (
          <div className="d-inline-flex flex-nowrap align-items-center gap-2 me-2">
            <Button
              variant="outline-success"
              className="text-nowrap"
              size="sm"
              onClick={() => handleStatusAction(row, 'ongoing')}
            >
              Start Treatment
            </Button>
            <Button
              variant="outline-primary"
              className="text-nowrap"
              size="sm"
              onClick={() => handleStatusAction(row, 'completed')}
            >
              Complete Visit
            </Button>
            <Button
              variant="outline-warning"
              className="text-nowrap"
              size="sm"
              onClick={() => handleAdmit(row)}
            >
              Admit Patient
            </Button>
            <Button
              variant="outline-danger"
              className="text-nowrap"
              size="sm"
              onClick={() => handleStatusAction(row, 'discharged')}
            >
              Discharge Patient
            </Button>
          </div>
        )}
        title="Appointments" 
      />
      
      <FormModal 
        show={showModal} 
        handleClose={() => setShowModal(false)} 
        title="Appointment" 
        formData={editingData} 
        setFormData={setEditingData} 
        onSubmit={handleSubmit}
        fieldConfig={{
          patientId: {
            label: 'Patient',
            type: 'select',
            options: patients.map((p) => ({ value: p._id, label: p.user?.name || p._id })),
          },
          doctorId: {
            label: 'Doctor',
            type: 'select',
            options: doctors.map((d) => ({ value: d._id, label: d.user?.name || d._id })),
          },
          date: { label: 'Date', type: 'date' },
          time: { label: 'Time', type: 'time' },
          visitType: {
            label: 'Visit Type',
            type: 'select',
            options: [
              { value: 'OPD', label: 'OPD' },
              { value: 'IPD', label: 'IPD' },
              { value: 'Emergency', label: 'Emergency' },
            ],
          },
          status: {
            label: 'Status',
            type: 'select',
            options: [
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'ongoing', label: 'Ongoing' },
              { value: 'admitted', label: 'Admitted' },
              { value: 'completed', label: 'Completed' },
              { value: 'discharged', label: 'Discharged' },
              { value: 'canceled', label: 'Canceled' },
            ],
          },
          symptoms: { label: 'Symptoms / Notes', required: false },
        }}
        fieldOrder={['patientId', 'doctorId', 'date', 'time', 'visitType', 'status', 'symptoms']}
      />

      <FormModal
        show={showAdmitModal}
        handleClose={() => setShowAdmitModal(false)}
        title="Admit Patient"
        formData={admitData}
        setFormData={setAdmitData}
        onSubmit={handleAdmitSubmit}
        fieldConfig={{
          roomType: {
            label: 'Room Type',
            type: 'select',
            options: [
              { value: 'General', label: 'General' },
              { value: 'Semi-Private', label: 'Semi-Private' },
              { value: 'Private', label: 'Private' },
              { value: 'ICU', label: 'ICU' },
            ],
          },
          roomNumber: { label: 'Room No' },
          bedNumber: { label: 'Bed No' },
        }}
        fieldOrder={['roomType', 'roomNumber', 'bedNumber']}
      />
    </div>
  );
};

export default Appointments;
