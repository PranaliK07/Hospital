// src/components/FormModal.jsx
import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

/**
 * Generic modal-driven form with light field configuration support.
 * Use fieldConfig to override label, type, options (for select), and required.
 */
const FormModal = ({
  show,
  handleClose,
  title,
  onSubmit,
  formData = {},
  setFormData,
  fieldConfig = {},
  fieldOrder
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const config = fieldConfig[name] || {};
    const parsedValue = config.type === 'number' ? Number(value) : value;
    setFormData({ ...formData, [name]: parsedValue });
  };

  const visibleFields = (fieldOrder && fieldOrder.length
    ? fieldOrder
    : Object.keys(formData || {})
  ).filter((key) => key !== 'id');

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          {visibleFields.map((key) => {
            const config = fieldConfig[key] || {};
            const label = config.label || key.replace(/([A-Z])/g, ' $1');
            const required = config.required !== false;
            const type = config.type || (key.toLowerCase().includes('email') ? 'email' : 'text');
            const options = config.options || null;

            return (
              <Form.Group className="mb-3" key={key}>
                <Form.Label className="text-capitalize">{label}</Form.Label>
                {options ? (
                  <Form.Select
                    name={key}
                    value={formData[key] ?? ''}
                    onChange={handleChange}
                    required={required}
                  >
                    <option value="">Select {label}...</option>
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Form.Select>
                ) : config.type === 'textarea' ? (
                  <Form.Control
                    as="textarea"
                    rows={config.rows || 3}
                    name={key}
                    value={formData[key] ?? ''}
                    onChange={handleChange}
                    required={required}
                  />
                ) : (
                  <Form.Control
                    type={type}
                    name={key}
                    value={formData[key] ?? ''}
                    onChange={handleChange}
                    required={required}
                  />
                )}
              </Form.Group>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" type="submit">Save</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FormModal;
