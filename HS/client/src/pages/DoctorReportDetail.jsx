import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import dataService from '../services/dataService';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { statusLabel, statusVariant } from '../utils/appointmentUtils';

const DoctorReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await dataService.getDoctorDetailReport(id);
        setData(response);
      } catch (err) {
        setError('Failed to load doctor report');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;
  if (!data) return null;

  const { doctor, stats, appointments, bills } = data;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">Doctor Report</h4>
          <div className="text-muted small">ID: {doctor.id}</div>
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
              <h6 className="text-muted">Basic Info</h6>
              <p className="mb-1"><strong>Name:</strong> {doctor.name}</p>
              <p className="mb-1"><strong>Email:</strong> {doctor.email}</p>
              <p className="mb-1"><strong>Specialization:</strong> {doctor.specialization}</p>
              <p className="mb-1"><strong>Experience:</strong> {doctor.experience} years</p>
            </Col>
            <Col md={6}>
              <h6 className="text-muted">Performance</h6>
              <p className="mb-1"><strong>Total Appointments:</strong> {stats.totalAppointments}</p>
              <p className="mb-1"><strong>Patients Handled:</strong> {stats.patientsHandled}</p>
              <p className="mb-1"><strong>Revenue Generated:</strong> Rs. {stats.revenueGenerated}</p>
              <p className="mb-1"><strong>Availability:</strong> {doctor.availability}</p>
              <p className="mb-1"><strong>Fees:</strong> Rs. {doctor.fees}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        <Col lg={8} className="mb-4">
          <Card className="dashboard-card h-100">
            <Card.Header className="bg-white"><strong>Appointment History</strong></Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Status</th>
                    <th>Symptoms</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-muted py-3">No appointments</td></tr>
                  )}
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{formatDate(appointment.date)}</td>
                      <td>{appointment.time}</td>
                      <td>{appointment.patientName}</td>
                      <td>
                        <Badge bg={statusVariant(appointment.status)}>
                          {statusLabel(appointment.status)}
                        </Badge>
                      </td>
                      <td>{appointment.symptoms || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card className="dashboard-card h-100">
            <Card.Header className="bg-white"><strong>Billing Records</strong></Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 && (
                    <tr><td colSpan={3} className="text-center text-muted py-3">No bills</td></tr>
                  )}
                  {bills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{formatDateTime(bill.createdAt)}</td>
                      <td>Rs. {bill.amount}</td>
                      <td>{bill.status}</td>
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

export default DoctorReportDetail;
