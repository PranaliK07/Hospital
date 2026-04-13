// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaUserMd, FaUsers, FaProcedures, FaRupeeSign } from 'react-icons/fa';
import CardStats from '../components/Cardstats';
import dataService from '../services/dataService';

const Dashboard = () => {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, revenue: 0, dashboardRole: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loggedInUser = JSON.parse(localStorage.getItem('hmsUser') || 'null');
  const role = stats.dashboardRole || loggedInUser?.role || 'User';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dataService.getStats();
        setStats((prev) => ({ ...prev, ...res }));
      } catch (err) {
        setError('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-4">{error}</Alert>;
  }

  return (
    <div className="content-wrapper">
      <h4 className="mb-4">{role} Dashboard</h4>
      <Row>
        <Col md={3}>
          <CardStats title="Total Doctors" value={stats.doctors} icon={<FaUserMd />} color="#0d6efd" />
        </Col>
        <Col md={3}>
          <CardStats title="Total Patients" value={stats.patients} icon={<FaUsers />} color="#198754" />
        </Col>
        <Col md={3}>
          <CardStats title="Appointments" value={stats.appointments} icon={<FaProcedures />} color="#ffc107" />
        </Col>
        <Col md={3}>
          <CardStats title="Revenue (Paid)" value={`\u20B9${stats.revenue}`} icon={<FaRupeeSign />} color="#dc3545" />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
