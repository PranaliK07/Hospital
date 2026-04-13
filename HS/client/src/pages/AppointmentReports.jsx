import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Badge, Button, Form, Spinner, Alert, Table } from 'react-bootstrap';
import dataService from '../services/dataService';
import ReportDateRangeModal from '../components/ReportDateRangeModal';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { statusLabel, statusVariant } from '../utils/appointmentUtils';

const AppointmentReports = () => {
  const [report, setReport] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [draftRange, setDraftRange] = useState({ from: '', to: '' });
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchReport = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await dataService.getAppointmentReport(filters);
      setReport(response || []);
      return true;
    } catch {
      setError('Failed to load appointment reports');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const generateAndPrint = async ({ from, to }) => {
    setGenerating(true);
    try {
      const ok = await fetchReport({ from, to });
      if (!ok) return;
      setRange({ from, to });
      setShowRangeModal(false);
      setTimeout(() => window.print(), 200);
    } finally {
      setGenerating(false);
    }
  };

  const filtered = report.filter((appointment) =>
    appointment.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    appointment.patientEmail?.toLowerCase().includes(search.toLowerCase()) ||
    appointment.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
    statusLabel(appointment.status)?.toLowerCase().includes(search.toLowerCase()) ||
    appointment.symptoms?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const header = ['Date', 'Time', 'Patient', 'Doctor', 'Status', 'Symptoms'];
    const rows = filtered.map((appointment) => [
      appointment.date,
      appointment.time,
      appointment.patientName,
      appointment.doctorName,
      statusLabel(appointment.status),
      appointment.symptoms || '',
    ]);

    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'appointment-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-0">Appointment Reports</h4>
          {range.from && range.to && (
            <div className="text-muted small">Report range: {formatDate(range.from)} to {formatDate(range.to)}</div>
          )}
        </div>
        <div className="d-flex gap-2">
          <Form.Control
            size="sm"
            placeholder="Search patient/doctor/status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: '240px' }}
          />
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setDraftRange(range);
              setShowRangeModal(true);
            }}
          >
            Report
          </Button>
          <Button variant="primary" size="sm" onClick={exportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      <Row>
        <Col md={12}>
          <Card className="dashboard-card border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <span className="fw-bold">Appointments</span>
              <Badge bg="primary">{filtered.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive striped hover className="mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Status</th>
                    <th>Symptoms</th>
                    <th>Report</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-3">No records</td>
                    </tr>
                  )}
                  {filtered.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{formatDateTime(appointment.date)}</td>
                      <td>{appointment.time}</td>
                      <td>{appointment.patientName}</td>
                      <td>{appointment.doctorName}</td>
                      <td>
                        <Badge bg={statusVariant(appointment.status)}>{statusLabel(appointment.status)}</Badge>
                      </td>
                      <td>{appointment.symptoms || '-'}</td>
                      <td>
                        <Button
                          as="a"
                          href={`/appointment-reports/${appointment.id}`}
                          size="sm"
                          variant="outline-primary"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ReportDateRangeModal
        show={showRangeModal}
        onHide={() => setShowRangeModal(false)}
        onGenerate={generateAndPrint}
        busy={generating}
        title="Appointment Report"
        from={draftRange.from}
        to={draftRange.to}
        onFromChange={(value) => setDraftRange((prev) => ({ ...prev, from: value }))}
        onToChange={(value) => setDraftRange((prev) => ({ ...prev, to: value }))}
      />
    </div>
  );
};

export default AppointmentReports;
