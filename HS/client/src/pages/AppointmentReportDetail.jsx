import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import dataService from '../services/dataService';
import { formatDateTime } from '../utils/dateUtils';
import { statusLabel, statusVariant } from '../utils/appointmentUtils';

const AppointmentReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await dataService.getAppointmentDetailReport(id);
        setData(response);
      } catch (err) {
        setError('Failed to load appointment report');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;
  if (!data) return null;

  const { appointment, patient, doctor, billingHistory } = data;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">Appointment Report</h4>
          <div className="text-muted small">ID: {appointment.id}</div>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="primary" size="sm" onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      <Card className="dashboard-card mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <h6 className="text-muted">Basic Info</h6>
              <p className="mb-1"><strong>Date:</strong> {formatDateTime(appointment.date)}</p>
              <p className="mb-1"><strong>Time:</strong> {appointment.time}</p>
              <p className="mb-1"><strong>Status:</strong> <Badge bg={statusVariant(appointment.status)}>{statusLabel(appointment.status)}</Badge></p>
              <p className="mb-1"><strong>Symptoms / Notes:</strong> {appointment.symptoms || 'N/A'}</p>
            </Col>
            <Col md={4}>
              <h6 className="text-muted">Patient Info</h6>
              <p className="mb-1"><strong>Name:</strong> {patient.name}</p>
              <p className="mb-1"><strong>Email:</strong> {patient.email}</p>
            </Col>
            <Col md={4}>
              <h6 className="text-muted">Doctor Info</h6>
              <p className="mb-1"><strong>Name:</strong> {doctor.name}</p>
              <p className="mb-1"><strong>Email:</strong> {doctor.email}</p>
              <p className="mb-1"><strong>Specialization:</strong> {doctor.specialization}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="dashboard-card">
        <Card.Header className="bg-white"><strong>Billing History</strong></Card.Header>
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
              {billingHistory.length === 0 && (
                <tr><td colSpan={4} className="text-center text-muted py-3">No billing records</td></tr>
              )}
              {billingHistory.map((bill) => (
                <tr key={bill.id}>
                  <td>{formatDateTime(bill.createdAt)}</td>
                  <td>Rs. {bill.amount}</td>
                  <td>{bill.status}</td>
                  <td>{bill.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AppointmentReportDetail;
