import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const ReportDateRangeModal = ({
  show,
  onHide,
  onGenerate,
  busy = false,
  title = 'Generate Report',
  from = '',
  to = '',
  onFromChange,
  onToChange,
}) => {
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!from || !to) {
      setError('Please select both From and To dates.');
      return;
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      setError('Please select valid dates.');
      return;
    }
    if (fromDate > toDate) {
      setError('From date must be before To date.');
      return;
    }

    await onGenerate({ from, to });
  };

  const hide = () => {
    if (busy) return;
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={hide} centered backdrop={busy ? 'static' : true}>
      <Modal.Header closeButton={!busy}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>From</Form.Label>
            <Form.Control
              type="date"
              value={from}
              onChange={(e) => {
                setError('');
                onFromChange?.(e.target.value);
              }}
              required
              disabled={busy}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>To</Form.Label>
            <Form.Control
              type="date"
              value={to}
              onChange={(e) => {
                setError('');
                onToChange?.(e.target.value);
              }}
              required
              disabled={busy}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hide} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={busy}>
            {busy ? 'Generating…' : 'Print Report'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ReportDateRangeModal;
