// src/pages/Billing.jsx
import React, { useEffect, useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import DataTable from '../components/Table';
import FormModal from '../components/FormModal';
import dataService from '../services/dataService';

const emptyBill = {
  id: null,
  patientId: '',
  amount: '',
  status: 'Pending',
  description: '',
};

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(emptyBill);

  useEffect(() => {
    const init = async () => {
      try {
        const [billRes, patientRes] = await Promise.all([
          dataService.getBills(),
          dataService.getPatients(),
        ]);

        const patientMap = patientRes.reduce((map, p) => {
          map[p._id] = p.user?.name || 'Unknown';
          return map;
        }, {});

        setPatients(patientRes);
        setBills(
          billRes.map((b) => ({
            id: b._id,
            patient: patientMap[b.patient] || b.patient?.user?.name || 'N/A',
            patientId: b.patient?._id || b.patient,
            amount: b.amount,
            status: b.status,
            description: b.description || '',
          }))
        );
      } catch (err) {
        setError('Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAdd = () => {
    setEditingData(emptyBill);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditingData({
      id: row.id,
      patientId: row.patientId,
      amount: row.amount,
      status: row.status,
      description: row.description,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    try {
      await dataService.deleteBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert('Failed to delete bill');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        patient: editingData.patientId,
        amount: editingData.amount,
        status: editingData.status,
        description: editingData.description,
      };

      const saved = editingData.id
        ? await dataService.updateBill(editingData.id, payload)
        : await dataService.createBill(payload);

      setShowModal(false);
      setBills((prev) => {
        const next = prev.filter((b) => b.id !== editingData.id);
        const resolvedPatientId = typeof saved.patient === 'object' ? saved.patient._id : saved.patient;
        return [
          ...next,
          {
            id: saved._id,
            patient: patients.find((p) => p._id === resolvedPatientId)?.user?.name || 'N/A',
            patientId: resolvedPatientId,
            amount: saved.amount,
            status: saved.status,
            description: saved.description || '',
          },
        ];
      });
    } catch (err) {
      alert('Error saving bill');
    }
  };

  const columns = [
    { label: 'Patient', field: 'patient' },
    { label: 'Amount', field: 'amount' },
    { label: 'Status', field: 'status' },
    { label: 'Description', field: 'description' },
  ];

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="content-wrapper">
       <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Billing & Invoices</h4>
        <Button onClick={handleAdd}><FaPlus /> Create Bill</Button>
      </div>
      <DataTable columns={columns} data={bills} onEdit={handleEdit} onDelete={handleDelete} title="Bills" />
      <FormModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        title="Invoice"
        formData={editingData}
        setFormData={setEditingData}
        onSubmit={handleSubmit}
        fieldConfig={{
          patientId: {
            label: 'Patient',
            type: 'select',
            options: patients.map((p) => ({ value: p._id, label: p.user?.name || p._id })),
          },
          amount: { label: 'Amount', type: 'number' },
          status: {
            label: 'Status',
            type: 'select',
            options: [
              { value: 'Pending', label: 'Pending' },
              { value: 'Paid', label: 'Paid' },
              { value: 'Overdue', label: 'Overdue' },
            ],
          },
          description: { label: 'Description', required: false },
        }}
        fieldOrder={['patientId', 'amount', 'status', 'description']}
      />
    </div>
  );
};

export default Billing;
