// src/pages/Doctors.jsx
import React, { useState, useEffect } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import DataTable from '../components/Table';
import FormModal from '../components/FormModal';
import dataService from '../services/dataService';

const emptyForm = {
  id: null,
  name: '',
  email: '',
  password: '',
  specialty: '',
  availability: 'Mon-Fri',
  experience: 0,
};

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(emptyForm);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await dataService.getDoctors();
      const formattedData = data.map((doc) => ({
        id: doc._id,
        name: doc.user?.name || 'N/A',
        email: doc.user?.email || 'N/A',
        specialty: doc.specialty,
        availability: doc.availability,
        experience: doc.experience ?? 0,
      }));
      setDoctors(formattedData);
      setFilteredDoctors(formattedData);
    } catch (err) {
      setError('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (doctor) => {
    setEditingData({ ...doctor, password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await dataService.deleteDoctor(id);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert('Failed to delete doctor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editingData.name,
        email: editingData.email,
        specialty: editingData.specialty,
        availability: editingData.availability,
        experience: editingData.experience,
      };
      if (editingData.password) payload.password = editingData.password;

      if (editingData.id) {
        await dataService.updateDoctor(editingData.id, payload);
      } else {
        await dataService.createDoctor({ ...payload, password: editingData.password || 'password123' });
      }
      setShowModal(false);
      fetchDoctors();
    } catch (err) {
      alert('Error saving doctor');
    }
  };

  const specialties = ['All', ...Array.from(new Set(doctors.map((d) => d.specialty).filter(Boolean)))];

  const handleSpecialtyFilter = (value) => {
    setSpecialtyFilter(value);
    if (!value || value === 'All') {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(doctors.filter((d) => d.specialty === value));
    }
  };

  const columns = [
    { label: 'Name', field: 'name' },
    { label: 'Specialty', field: 'specialty' },
    { label: 'Email', field: 'email' },
    { label: 'Availability', field: 'availability' },
    { label: 'Experience (yrs)', field: 'experience' },
  ];

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="mb-0">Doctor Management</h4>
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={specialtyFilter}
            onChange={(e) => handleSpecialtyFilter(e.target.value)}
          >
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button variant="primary" onClick={handleAdd}><FaPlus /> Add Doctor</Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredDoctors}
        onEdit={handleEdit}
        onDelete={handleDelete}
        title="Doctors List"
      />

      <FormModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        title="Doctor Details"
        formData={editingData}
        setFormData={setEditingData}
        onSubmit={handleSubmit}
        fieldConfig={{
          name: { label: 'Full Name' },
          email: { type: 'email', label: 'Email' },
          password: { label: 'Password', required: false },
          specialty: { label: 'Specialty' },
          availability: { label: 'Availability' },
          experience: { label: 'Experience (years)', type: 'number', required: false },
        }}
      />
    </div>
  );
};

export default Doctors;
