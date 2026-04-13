// src/pages/Patients.jsx
import React, { useEffect, useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import DataTable from '../components/Table';
import FormModal from '../components/FormModal';
import dataService from '../services/dataService';

const emptyPatient = {
  id: null,
  name: '',
  email: '',
  password: '',
  age: '',
  gender: '',
  contact: '',
  address: '',
  medicalHistory: '',
};

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(emptyPatient);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await dataService.getPatients();
      const formatted = res.map((p) => ({
        id: p._id,
        name: p.user?.name || 'N/A',
        email: p.user?.email || '',
        age: p.age,
        gender: p.gender,
        contact: p.contact || '',
        address: p.address || '',
        medicalHistory: p.medicalHistory || '',
      }));
      setPatients(formatted);
    } catch (err) {
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingData(emptyPatient);
    setShowModal(true);
  };

  const handleEdit = (patient) => {
    setEditingData({ ...patient, password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient record?')) return;
    try {
      await dataService.deletePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete patient');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editingData.name,
        email: editingData.email,
        password: editingData.password,
        age: editingData.age,
        gender: editingData.gender,
        contact: editingData.contact,
        address: editingData.address,
        medicalHistory: editingData.medicalHistory,
      };

      if (editingData.id) {
        if (!payload.password) delete payload.password;
        await dataService.updatePatient(editingData.id, payload);
      } else {
        await dataService.createPatient(payload);
      }
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      alert('Error saving patient');
    }
  };

  const columns = [
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' },
    { label: 'Age', field: 'age' },
    { label: 'Gender', field: 'gender' },
    { label: 'Contact', field: 'contact' },
    { label: 'Address', field: 'address' },
    { label: 'Medical History', field: 'medicalHistory' },
  ];

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Patient Management</h4>
        <Button variant="primary" onClick={handleAdd}><FaPlus /> Add Patient</Button>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        onEdit={handleEdit}
        onDelete={handleDelete}
        title="Patient Records"
      />

      <FormModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        title="Patient Details"
        formData={editingData}
        setFormData={setEditingData}
        onSubmit={handleSubmit}
        fieldConfig={{
          name: { label: 'Full Name' },
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', required: !editingData.id },
          age: { label: 'Age', type: 'number' },
          gender: {
            label: 'Gender',
            type: 'select',
            options: [
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ],
          },
          contact: { label: 'Contact' },
          address: { label: 'Address' },
          medicalHistory: { label: 'Medical History', type: 'textarea', required: false },
        }}
        fieldOrder={['name', 'email', 'password', 'age', 'gender', 'contact', 'address', 'medicalHistory']}
      />
    </div>
  );
};

export default Patients;
