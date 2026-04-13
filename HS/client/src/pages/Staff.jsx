// src/pages/Staff.jsx
import React, { useEffect, useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import DataTable from '../components/Table';
import FormModal from '../components/FormModal';
import dataService from '../services/dataService';

const emptyStaff = {
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'Nurse',
  department: '',
  shift: 'Day',
};

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(emptyStaff);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await dataService.getStaff();
      const formatted = res.map((member) => ({
        id: member._id,
        name: member.user?.name || '',
        email: member.user?.email || '',
        role: member.role,
        department: member.department || '',
        shift: member.shift,
      }));
      setStaff(formatted);
    } catch (err) {
      setError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingData(emptyStaff);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditingData({ ...row, password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      await dataService.deleteStaff(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert('Failed to delete staff');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editingData.name,
        email: editingData.email,
        password: editingData.password,
        role: editingData.role,
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
      fetchStaff();
    } catch (err) {
      alert('Error saving staff');
    }
  };

  const columns = [
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' },
    { label: 'Role', field: 'role' },
    { label: 'Department', field: 'department' },
    { label: 'Shift', field: 'shift' },
  ];

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Staff Management</h4>
        <Button onClick={handleAdd}><FaPlus /> Add Staff</Button>
      </div>
      <DataTable columns={columns} data={staff} onEdit={handleEdit} onDelete={handleDelete} title="Staff Directory" />
      <FormModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        title="Staff Details"
        formData={editingData}
        setFormData={setEditingData}
        onSubmit={handleSubmit}
        fieldConfig={{
          name: { label: 'Full Name' },
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', required: !editingData.id },
          role: {
            label: 'Role',
            type: 'select',
            options: [
              { value: 'Nurse', label: 'Nurse' },
              { value: 'Technician', label: 'Technician' },
              { value: 'Receptionist', label: 'Receptionist' },
              { value: 'Support', label: 'Support' },
            ],
          },
          department: { label: 'Department' },
          shift: {
            label: 'Shift',
            type: 'select',
            options: [
              { value: 'Day', label: 'Day' },
              { value: 'Night', label: 'Night' },
              { value: 'Rotational', label: 'Rotational' },
            ],
          },
        }}
        fieldOrder={['name', 'email', 'password', 'role', 'department', 'shift']}
      />
    </div>
  );
};

export default Staff;
