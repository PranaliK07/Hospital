// src/pages/Receptionists.jsx
import React, { useEffect, useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import DataTable from '../components/Table';
import FormModal from '../components/FormModal';
import dataService from '../services/dataService';

const emptyReceptionist = {
  id: null,
  name: '',
  email: '',
  password: '',
  department: 'Front Desk',
  shift: 'Morning',
};

const Receptionists = () => {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(emptyReceptionist);

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const fetchReceptionists = async () => {
    try {
      const res = await dataService.getStaff();
      const recps = res
        .filter((s) => s.role === 'Receptionist')
        .map((s) => ({
          id: s._id,
          name: s.user?.name || '',
          email: s.user?.email || '',
          department: s.department || 'Front Desk',
          shift: s.shift,
        }));
      setReceptionists(recps);
    } catch (err) {
      setError('Failed to load receptionists');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingData(emptyReceptionist);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditingData({ ...row, password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this receptionist?')) return;
    try {
      await dataService.deleteStaff(id);
      setReceptionists((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Failed to delete receptionist');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editingData.name,
        email: editingData.email,
        password: editingData.password,
        role: 'Receptionist',
        department: editingData.department,
        shift: editingData.shift,
      };

      if (editingData.id) {
        if (!payload.password) delete payload.password;
        await dataService.updateStaff(editingData.id, payload);
      } else {
        await dataService.createStaff(payload);
      }
      setShowModal(false);
      fetchReceptionists();
    } catch (err) {
      alert('Error saving receptionist');
    }
  };

  const columns = [
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' },
    { label: 'Department', field: 'department' },
    { label: 'Shift', field: 'shift' },
  ];

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Receptionist Management</h4>
        <Button variant="primary" onClick={handleAdd}><FaPlus /> Add Receptionist</Button>
      </div>

      <DataTable
        columns={columns}
        data={receptionists}
        onEdit={handleEdit}
        onDelete={handleDelete}
        title="Receptionists List"
      />

      <FormModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        title="Receptionist Details"
        formData={editingData}
        setFormData={setEditingData}
        onSubmit={handleSubmit}
        fieldConfig={{
          name: { label: 'Full Name' },
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', required: !editingData.id },
          department: { label: 'Department' },
          shift: {
            label: 'Shift',
            type: 'select',
            options: [
              { value: 'Morning', label: 'Morning' },
              { value: 'Evening', label: 'Evening' },
              { value: 'Night', label: 'Night' },
            ],
          },
        }}
        fieldOrder={['name', 'email', 'password', 'department', 'shift']}
      />
    </div>
  );
};

export default Receptionists;
