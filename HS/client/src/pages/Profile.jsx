// src/pages/Profile.jsx
import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState({ ...user, name: user?.name || '', email: 'admin@hms.com' });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleSave = (e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="content-wrapper">
      <Card className="dashboard-card" style={{ maxWidth: '600px' }}>
        <Card.Body>
          <h4>My Profile</h4>
          {saved && <Alert variant="success">Profile updated!</Alert>}
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control name="name" value={profile.name} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" type="email" value={profile.email} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Control value={profile.role} disabled />
            </Form.Group>
            <Button type="submit">Update Profile</Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Profile;