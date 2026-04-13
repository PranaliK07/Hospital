import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spinner, Alert, Table, Button, Badge } from 'react-bootstrap';
import dataService from '../services/dataService';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { statusLabel } from '../utils/appointmentUtils';

const PatientReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dataService.getPatientDetailReport(id);
        setData(res);
      } catch (err) {
        setError('Failed to load patient report');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;
  if (!data) return null;

  const { patient, appointments, bills } = data;
  const admission = patient.admission;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">Patient Report</h4>
          <div className="text-muted small">ID: {patient.id}</div>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="primary" size="sm" onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      <Card className="dashboard-card mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6 className="text-muted">Patient Details</h6>
              <p className="mb-1"><strong>Name:</strong> {patient.name}</p>
              <p className="mb-1"><strong>Email:</strong> {patient.email}</p>
              <p className="mb-1"><strong>Age:</strong> {patient.age ?? '-'}</p>
              <p className="mb-1"><strong>Gender:</strong> {patient.gender || '-'}</p>
              <p className="mb-1"><strong>Contact:</strong> {patient.contact || 'N/A'}</p>
              <p className="mb-1"><strong>Address:</strong> {patient.address || 'N/A'}</p>
            </Col>
            <Col md={6}>
              <h6 className="text-muted">Clinical</h6>
              <p className="mb-1">
                <strong>Status:</strong>{' '}
                <Badge bg={patient.status === 'Discharged' ? 'success' : patient.status === 'Outpatient' ? 'warning' : 'info'}>
                  {patient.status}
                </Badge>
              </p>
              <p className="mb-1"><strong>Medical History:</strong> {patient.medicalHistory || 'N/A'}</p>
              <p className="mb-1"><strong>Room Type:</strong> {admission?.roomType || 'N/A'}</p>
              <p className="mb-1"><strong>Room No:</strong> {admission?.roomNumber || 'N/A'}</p>
              <p className="mb-1"><strong>Bed No:</strong> {admission?.bedNumber || 'N/A'}</p>
              <p className="mb-1"><strong>Admitted On:</strong> {admission?.admissionDate ? formatDateTime(admission.admissionDate) : 'N/A'}</p>
              <p className="mb-1"><strong>Discharged On:</strong> {admission?.dischargeDate ? formatDateTime(admission.dischargeDate) : 'N/A'}</p>
              <p className="mb-1"><strong>Last Updated:</strong> {formatDateTime(patient.updatedAt)}</p>
              <p className="mb-1 text-muted small"><strong>Created:</strong> {formatDateTime(patient.createdAt)}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card h-100">
            <Card.Header className="bg-white"><strong>Appointments</strong></Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Doctor</th>
                    <th>Status</th>
                    <th>Room</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-muted py-3">No appointments</td></tr>
                  )}
                  {appointments.map((a) => (
                    <tr key={a.id}>
                      <td>{formatDate(a.date)}</td>
                      <td>{a.time}</td>
                      <td>{a.doctor}</td>
                      <td>{statusLabel(a.status)}</td>
                      <td>{a.roomType ? `${a.roomType} / ${a.roomNumber} / ${a.bedNumber}` : 'N/A'}</td>
                      <td>{a.symptoms || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="dashboard-card h-100">
            <Card.Header className="bg-white"><strong>Billing</strong></Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted py-3">No bills</td></tr>
                  )}
                  {bills.map((b) => (
                    <tr key={b.id}>
                      <td>{formatDate(b.createdAt)}</td>
                      <td>₹{b.amount}</td>
                      <td>{b.status}</td>
                      <td>{b.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PatientReportDetail;
