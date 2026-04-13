import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Badge, Button, Form, Spinner, Alert, Table } from 'react-bootstrap';
import dataService from '../services/dataService';
import ReportDateRangeModal from '../components/ReportDateRangeModal';
import { formatDate, formatDateTime } from '../utils/dateUtils';

const BillingReports = () => {
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
      const response = await dataService.getBillingReport(filters);
      setReport(response || []);
      return true;
    } catch {
      setError('Failed to load billing reports');
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

  const filtered = report.filter((bill) =>
    bill.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    bill.patientEmail?.toLowerCase().includes(search.toLowerCase()) ||
    bill.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
    bill.status?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const header = ['Patient', 'Patient Email', 'Doctor', 'Amount', 'Status', 'Billing Date'];
    const rows = filtered.map((bill) => [
      bill.patientName,
      bill.patientEmail,
      bill.doctorName,
      bill.amount,
      bill.status,
      bill.billingDate,
    ]);

    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'billing-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusVariant = (status) => {
    if (status === 'Paid') return 'success';
    if (status === 'Pending') return 'warning';
    return 'danger';
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-0">Billing Reports</h4>
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
              <span className="fw-bold">Bills</span>
              <Badge bg="primary">{filtered.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive striped hover className="mb-0">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Billing Date</th>
                    <th>Report</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-3">No records</td>
                    </tr>
                  )}
                  {filtered.map((bill) => (
                    <tr key={bill.id}>
                      <td>
                        <div>{bill.patientName}</div>
                        <small className="text-muted">{bill.patientEmail}</small>
                      </td>
                      <td>{bill.doctorName}</td>
                      <td>Rs. {bill.amount}</td>
                      <td>
                        <Badge bg={statusVariant(bill.status)}>{bill.status}</Badge>
                      </td>
                      <td>{formatDateTime(bill.billingDate)}</td>
                      <td>
                        <Button
                          as="a"
                          href={`/billing-reports/${bill.id}`}
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
        title="Billing Report"
        from={draftRange.from}
        to={draftRange.to}
        onFromChange={(value) => setDraftRange((prev) => ({ ...prev, from: value }))}
        onToChange={(value) => setDraftRange((prev) => ({ ...prev, to: value }))}
      />
    </div>
  );
};

export default BillingReports;
