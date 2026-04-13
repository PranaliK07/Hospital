// src/pages/Admissions.jsx
import React, { useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import DataTable from '../components/Table';
import FormModal from '../components/FormModal';
import dataService from '../services/dataService';
import { normalizeStatus, normalizeVisitType, statusLabel, statusVariant } from '../utils/appointmentUtils';

const emptyAdmission = {
  id: null,
  roomType: '',
  roomNumber: '',
  bedNumber: '',
};

const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(emptyAdmission);

  const mapAdmissions = (list = []) =>
    (list || []).map((a) => {
      const visit = a.visitId || {};
      const statusSource = a.status || visit.status;
      return {
        id: a._id,
        patient: visit.patient?.user?.name || 'N/A',
        doctor: visit.doctor?.user?.name || 'N/A',
        date: visit.date ? String(visit.date).substring(0, 10) : '',
        time: visit.time || '',
        roomType: a.roomType || 'N/A',
        roomNumber: a.roomNumber || 'N/A',
        bedNumber: a.bedNumber || 'N/A',
        status: normalizeStatus(statusSource),
        visitType: normalizeVisitType(visit.visitType),
      };
    });

  useEffect(() => {
    const load = async () => {
      try {
        const list = await dataService.getAdmissions();
        setAdmissions(mapAdmissions(list));
      } catch (err) {
        setError('Failed to load admissions');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleEdit = (row) => {
    setEditingData({
      id: row.id,
      roomType: row.roomType === 'N/A' ? '' : row.roomType,
      roomNumber: row.roomNumber === 'N/A' ? '' : row.roomNumber,
      bedNumber: row.bedNumber === 'N/A' ? '' : row.bedNumber,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        roomType: editingData.roomType,
        roomNumber: editingData.roomNumber,
        bedNumber: editingData.bedNumber,
      };

      await dataService.updateAdmission(editingData.id, payload);
      setShowModal(false);
      const refreshed = await dataService.getAdmissions();
      setAdmissions(mapAdmissions(refreshed));
    } catch (err) {
      alert('Error updating admission');
    }
  };

  const columns = [
    { label: 'Patient', field: 'patient' },
    { label: 'Doctor', field: 'doctor' },
    { label: 'Date', field: 'date' },
    { label: 'Time', field: 'time' },
    { label: 'Room Type', field: 'roomType' },
    { label: 'Room No', field: 'roomNumber' },
    { label: 'Bed No', field: 'bedNumber' },
    { label: 'Status', field: 'status', format: (value) => statusLabel(value), badgeVariant: (value) => statusVariant(value) },
  ];

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Admissions</h4>
      </div>

      <DataTable
        columns={columns}
        data={admissions}
        onEdit={handleEdit}
        title="Admissions"
      />

      <FormModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        title="Edit Room Details"
        formData={editingData}
        setFormData={setEditingData}
        onSubmit={handleSubmit}
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

export default Admissions;
