import React, { useEffect, useState } from 'react';
import { Card, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import accessService from '../services/accessService';
import { accessMenuItems } from '../config/accessMenuItems';
import { expandAllowedRoutes } from '../utils/accessUtils';

const roles = ['Admin', 'Doctor', 'Staff', 'Receptionist', 'Patient'];

const BusinessSettings = () => {
  const [settings, setSettings] = useState({});
  const [selectedRole, setSelectedRole] = useState('Doctor');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSettings = async () => {
    const data = await accessService.getAllAccess();
    const map = data.reduce((acc, item) => {
      acc[item.role] = expandAllowedRoutes(item.allowedRoutes);
      return acc;
    }, {});
    setSettings(map);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadSettings();
      } catch (err) {
        setError('Failed to load access settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleRoute = (route) => {
    setSettings((prev) => {
      const current = new Set(prev[selectedRole] || []);
      if (current.has(route)) current.delete(route);
      else current.add(route);
      return { ...prev, [selectedRole]: Array.from(current) };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await accessService.updateAccess(selectedRole, settings[selectedRole] || []);
      setSettings((prev) => ({ ...prev, [selectedRole]: updated.allowedRoutes || [] }));
      await loadSettings();
      localStorage.setItem('hmsAccessUpdatedAt', String(Date.now()));
      window.dispatchEvent(new Event('hms-access-updated'));
      setSuccess('Access updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update access');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(''), 1500);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="mb-0">Business Settings</h4>
        <Form.Select
          style={{ width: '200px' }}
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </Form.Select>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <strong>Sidebar Access for {selectedRole}</strong>
        </Card.Header>
        <Card.Body>
          <Row xs={1} sm={2} md={3}>
            {accessMenuItems.map((item) => {
              const checked = (settings[selectedRole] || []).includes(item.to);
              return (
                <Col className="mb-3" key={item.to}>
                  <Form.Check
                    type="checkbox"
                    id={`${selectedRole}-${item.to}`}
                    label={item.label}
                    checked={checked}
                    onChange={() => toggleRoute(item.to)}
                  />
                </Col>
              );
            })}
          </Row>
          <div className="d-flex justify-content-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BusinessSettings;
