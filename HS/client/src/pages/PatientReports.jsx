import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Badge, Button, Form, Spinner, Alert, Table } from 'react-bootstrap';
import dataService from '../services/dataService';
import ReportDateRangeModal from '../components/ReportDateRangeModal';
import { formatDate, formatDateTime } from '../utils/dateUtils';

const isOlderThan12Months = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const diffMonths = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  return diffMonths > 12;
};

const statusOrder = ['Admitted', 'Discharged', 'Outpatient'];

const PatientReports = () => {
  const [report, setReport] = useState({ admitted: [], discharged: [], outpatient: [] });
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
      const res = await dataService.getPatientReport(filters);
      setReport(res);
      return true;
    } catch {
      setError('Failed to load patient reports');
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

  const filteredList = (list) =>
    (list || []).filter(
      (p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.doctor?.toLowerCase().includes(search.toLowerCase())
    );

  const exportCSV = () => {
    const rows = [];
    statusOrder.forEach((statusKey) => {
      (report[statusKey.toLowerCase()] || []).forEach((p) => {
        rows.push([
          p.name,
          p.email,
          statusKey,
          p.doctor,
          p.roomType || '',
          p.roomNumber || '',
          p.bedNumber || '',
          p.lastVisit ? new Date(p.lastVisit).toISOString().slice(0, 10) : '',
        ]);
      });
    });
    const header = ['Name', 'Email', 'Status', 'Doctor', 'Room Type', 'Room Number', 'Bed Number', 'Last Visit'];
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'patient-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

  return (
    <div className="content-wrapper patient-report-print">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-0">Patient Reports</h4>
          {range.from && range.to && (
            <div className="text-muted small">Report range: {formatDate(range.from)} to {formatDate(range.to)}</div>
          )}
        </div>
        <div className="d-flex gap-2">
          <Form.Control
            size="sm"
            placeholder="Search patient/doctor/email"
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
        {statusOrder.map((label) => {
          const key = label.toLowerCase();
          const list = filteredList(report[key] || []);
          return (
            <Col md={12} className="mb-4" key={label}>
              <Card className="dashboard-card border-0 shadow-sm">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <span className="fw-bold">{label} Patients</span>
                  <Badge bg={label === 'Admitted' ? 'info' : label === 'Discharged' ? 'success' : 'warning'}>
                    {list.length}
                  </Badge>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive striped hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Doctor</th>
                        <th>Doctor Email</th>
                        <th>Admitted On</th>
                        <th>Discharged On</th>
                        <th>Room Type</th>
                        <th>Room No</th>
                        <th>Bed No</th>
                        <th>Status</th>
                        <th>Last Visit</th>
                        <th>Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.length === 0 && (
                        <tr>
                          <td colSpan={12} className="text-center text-muted py-3">No records</td>
                        </tr>
                      )}
                      {list.map((p, idx) => (
                        <tr key={idx}>
                          <td>{p.name}</td>
                          <td>{p.email}</td>
                          <td>{p.doctor}</td>
                          <td>{p.doctorEmail || 'N/A'}</td>
                          <td>{formatDateTime(p.admittedAt)}</td>
                          <td>{p.status === 'Discharged' ? formatDateTime(p.dischargedAt || p.updatedAt) : 'N/A'}</td>
                          <td>{p.roomType || 'N/A'}</td>
                          <td>{p.roomNumber || 'N/A'}</td>
                          <td>{p.bedNumber || 'N/A'}</td>
                          <td>{label}</td>
                          <td className={isOlderThan12Months(p.lastVisit) ? 'text-warning fw-semibold' : ''}>
                            {formatDate(p.lastVisit)}
                            {isOlderThan12Months(p.lastVisit) && ' (12+ mo)'}
                          </td>
                          <td>
                            <Button
                              as="a"
                              href={`/patient-reports/${p.id}`}
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
          );
        })}
      </Row>

      <ReportDateRangeModal
        show={showRangeModal}
        onHide={() => setShowRangeModal(false)}
        onGenerate={generateAndPrint}
        busy={generating}
        title="Patient Report"
        from={draftRange.from}
        to={draftRange.to}
        onFromChange={(value) => setDraftRange((prev) => ({ ...prev, from: value }))}
        onToChange={(value) => setDraftRange((prev) => ({ ...prev, to: value }))}
      />
    </div>
  );
};

export default PatientReports;
