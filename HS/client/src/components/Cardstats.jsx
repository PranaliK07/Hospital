// src/components/CardStats.jsx
import React from 'react';
import { Card } from 'react-bootstrap';

const CardStats = ({ title, value, icon, color }) => {
  return (
    <Card className="dashboard-card mb-3">
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="text-muted mb-2">{title}</h6>
          <h2 className="mb-0 font-weight-bold">{value}</h2>
        </div>
        <div className="stat-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CardStats;