// src/pages/Reports.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, ListGroup, Spinner, Alert, Badge, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaRupeeSign, FaUserMd, FaUserInjured, FaProcedures, FaHospitalUser } from 'react-icons/fa';
import CardStats from '../components/Cardstats';
import dataService from '../services/dataService';
import { formatDate } from '../utils/dateUtils';
import '../styles.css';

const Reports = () => {
  const [summary, setSummary] = useState({ totalRevenue: 0, totalPatients: 0, totalAppointments: 0 });
  const [patientReport, setPatientReport] = useState({ admitted: [], discharged: [], outpatient: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [res, patients] = await Promise.all([
          dataService.getReportSummary(),
          dataService.getPatientReport(),
        ]);
        setSummary(res);
        setPatientReport(patients);
      } catch (err) {
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Reports & Analytics</h4>
        <div className="d-flex align-items-center gap-2">
         
        </div>
      </div>

      <Row className="mb-4">
        <Col md={12}>
          <Card className="dashboard-card border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
              <h5 className="fw-bold">Reports Categories</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                <Button as={Link} to="/patient-reports" size="sm" variant="outline-primary">Patient Reports</Button>
                <Button as={Link} to="/doctor-reports" size="sm" variant="outline-primary">Doctor Reports</Button>
                <Button as={Link} to="/billing-reports" size="sm" variant="outline-primary">Billing Reports</Button>
                <Button as={Link} to="/appointment-reports" size="sm" variant="outline-primary">Appointment Reports</Button>
                <Button as={Link} to="/staff-reports" size="sm" variant="outline-primary">Staff Reports</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <CardStats title="Total Revenue (Paid)" value={`₹${summary.totalRevenue || 0}`} icon={<FaRupeeSign />} color="#198754" />
        </Col>
        <Col md={4}>
          <CardStats title="Total Patients" value={summary.totalPatients || 0} icon={<FaUserInjured />} color="#0d6efd" />
        </Col>
        <Col md={4}>
          <CardStats title="Total Appointments" value={summary.totalAppointments || 0} icon={<FaProcedures />} color="#fd7e14" />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <CardStats title="Admitted Patients" value={summary.admitted || 0} icon={<FaHospitalUser />} color="#0ea5e9" />
        </Col>
        <Col md={4}>
          <CardStats title="Discharged Patients" value={summary.discharged || 0} icon={<FaHospitalUser />} color="#22c55e" />
        </Col>
        <Col md={4}>
          <CardStats title="Outpatients" value={summary.outpatient || 0} icon={<FaHospitalUser />} color="#f97316" />
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
              <h5 className="fw-bold">Revenue Detail</h5>
              <p className="text-muted small mb-0">Summed from paid bills</p>
            </Card.Header>
            <Card.Body>
              <p className="fs-3 fw-bold">₹{summary.totalRevenue || 0}</p>
              <p className="text-muted">Keep billing statuses updated to reflect here.</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="dashboard-card h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
              <h5 className="fw-bold">Recent Snapshot</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                <ListGroup.Item className="px-4 py-3 d-flex justify-content-between">
                  <span className="text-muted">Patients in system</span>
                  <Badge bg="primary" pill>{summary.totalPatients || 0}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="px-4 py-3 d-flex justify-content-between">
                  <span className="text-muted">Appointments recorded</span>
                  <Badge bg="warning" text="dark" pill>{summary.totalAppointments || 0}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="px-4 py-3 d-flex justify-content-between">
                  <span className="text-muted">Paid revenue</span>
                  <Badge bg="success" pill>₹{summary.totalRevenue || 0}</Badge>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row ref={printRef}>
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
              <h5 className="fw-bold">Doctor Workload (Top 5)</h5>
            </Card.Header>
            <Card.Body>
              <Table variant="dark" striped hover responsive>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th className="text-end">Appointments</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary.doctorStats || []).map((d, idx) => (
                    <tr key={idx}>
                      <td>{d.doctor}</td>
                      <td className="text-end">{d.total}</td>
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

export default Reports;
