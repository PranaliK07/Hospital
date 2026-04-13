import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import dataService from '../services/dataService';
import { formatDateTime } from '../utils/dateUtils';
import { statusLabel } from '../utils/appointmentUtils';

const BillingReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await dataService.getBillingDetailReport(id);
        setData(response);
      } catch (err) {
        setError('Failed to load billing report');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;
  if (!data) return null;

  const { billing, patient, appointment, paymentHistory } = data;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">Billing Report</h4>
          <div className="text-muted small">ID: {billing.id}</div>
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
              <p className="mb-1"><strong>Amount:</strong> Rs. {billing.amount}</p>
              <p className="mb-1"><strong>Status:</strong> <Badge bg={billing.status === 'Paid' ? 'success' : billing.status === 'Pending' ? 'warning' : 'danger'}>{billing.status}</Badge></p>
              <p className="mb-1"><strong>Date:</strong> {formatDateTime(billing.createdAt)}</p>
              <p className="mb-1"><strong>Description:</strong> {billing.description || 'N/A'}</p>
            </Col>
            <Col md={4}>
              <h6 className="text-muted">Patient Info</h6>
              <p className="mb-1"><strong>Name:</strong> {patient.name}</p>
              <p className="mb-1"><strong>Email:</strong> {patient.email}</p>
            </Col>
            <Col md={4}>
              <h6 className="text-muted">Appointment</h6>
              <p className="mb-1"><strong>Doctor:</strong> {appointment?.doctorName || 'N/A'}</p>
              <p className="mb-1"><strong>Doctor Email:</strong> {appointment?.doctorEmail || 'N/A'}</p>
              <p className="mb-1"><strong>Date & Time:</strong> {appointment ? `${formatDateTime(appointment.date)} (${appointment.time})` : 'N/A'}</p>
              <p className="mb-1"><strong>Status:</strong> {appointment ? statusLabel(appointment.status) : 'N/A'}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="dashboard-card">
        <Card.Header className="bg-white"><strong>Payment Details / History</strong></Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.length === 0 && (
                <tr><td colSpan={4} className="text-center text-muted py-3">No payment history</td></tr>
              )}
              {paymentHistory.map((history, index) => (
                <tr key={`${history.date}-${index}`}>
                  <td>{formatDateTime(history.date)}</td>
                  <td>Rs. {history.amount}</td>
                  <td>{history.status}</td>
                  <td>{history.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BillingReportDetail;
