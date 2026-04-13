import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Badge, Button, Form, Spinner, Alert, Table } from 'react-bootstrap';
import dataService from '../services/dataService';
import ReportDateRangeModal from '../components/ReportDateRangeModal';
import { formatDate, formatDateTime } from '../utils/dateUtils';

const StaffReports = () => {
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
      const response = await dataService.getStaffReport(filters);
      setReport(response || []);
      return true;
    } catch {
      setError('Failed to load staff reports');
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

  const filtered = report.filter((staff) =>
    staff.name?.toLowerCase().includes(search.toLowerCase()) ||
    staff.email?.toLowerCase().includes(search.toLowerCase()) ||
    staff.role?.toLowerCase().includes(search.toLowerCase()) ||
    staff.department?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const header = ['Name', 'Email', 'Role', 'Department', 'Shift', 'Assigned Records', 'Updated On'];
    const rows = filtered.map((staff) => [
      staff.name,
      staff.email,
      staff.role,
      staff.department,
      staff.shift,
      staff.assignedRecords,
      staff.updatedAt,
    ]);

    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'staff-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-0">Staff Reports</h4>
          {range.from && range.to && (
            <div className="text-muted small">Report range: {formatDate(range.from)} to {formatDate(range.to)}</div>
          )}
        </div>
        <div className="d-flex gap-2">
          <Form.Control
            size="sm"
            placeholder="Search name/email/role"
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
              <span className="fw-bold">Staff</span>
              <Badge bg="primary">{filtered.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive striped hover className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Shift</th>
                    <th>Assigned Records</th>
                    <th>Updated On</th>
                    <th>Report</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-3">No records</td>
                    </tr>
                  )}
                  {filtered.map((staff) => (
                    <tr key={staff.id}>
                      <td>{staff.name}</td>
                      <td>{staff.email}</td>
                      <td><Badge bg="info">{staff.role}</Badge></td>
                      <td>{staff.department}</td>
                      <td>{staff.shift}</td>
                      <td>{staff.assignedRecords}</td>
                      <td>{formatDateTime(staff.updatedAt)}</td>
                      <td>
                        <Button
                          as="a"
                          href={`/staff-reports/${staff.id}`}
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
        title="Staff Report"
        from={draftRange.from}
        to={draftRange.to}
        onFromChange={(value) => setDraftRange((prev) => ({ ...prev, from: value }))}
        onToChange={(value) => setDraftRange((prev) => ({ ...prev, to: value }))}
      />
    </div>
  );
};

export default StaffReports;
