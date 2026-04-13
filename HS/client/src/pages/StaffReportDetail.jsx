import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import dataService from '../services/dataService';
import { formatDateTime } from '../utils/dateUtils';

const StaffReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await dataService.getStaffDetailReport(id);
        setData(response);
      } catch (err) {
        setError('Failed to load staff report');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;
  if (!data) return null;

  const { staff, activity } = data;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">Staff Report</h4>
          <div className="text-muted small">ID: {staff.id}</div>
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
              <p className="mb-1"><strong>Name:</strong> {staff.name}</p>
              <p className="mb-1"><strong>Email:</strong> {staff.email}</p>
              <p className="mb-1"><strong>Role:</strong> {staff.role}</p>
              <p className="mb-1"><strong>Department:</strong> {staff.department}</p>
              <p className="mb-1"><strong>Shift:</strong> {staff.shift}</p>
            </Col>
            <Col md={6}>
              <h6 className="text-muted">Activity</h6>
              <p className="mb-1"><strong>Assigned Records:</strong> {activity.assignedRecords}</p>
              <p className="mb-1"><strong>Role-based Staff Count:</strong> {activity.roleBasedCount}</p>
              <p className="mb-1"><strong>Created On:</strong> {formatDateTime(staff.createdAt)}</p>
              <p className="mb-1"><strong>Last Updated:</strong> {formatDateTime(staff.updatedAt)}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="dashboard-card">
        <Card.Header className="bg-white"><strong>Recent Assigned Records</strong></Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activity.recentAppointments.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted py-3">No activity records</td></tr>
              )}
              {activity.recentAppointments.map((record) => (
                <tr key={record.id}>
                  <td>{formatDateTime(record.date)}</td>
                  <td>{record.time}</td>
                  <td>{record.patient}</td>
                  <td>{record.doctor}</td>
                  <td>{record.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StaffReportDetail;
