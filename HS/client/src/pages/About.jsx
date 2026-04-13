// src/pages/About.jsx
import React from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
import { FaHospital, FaBullseye, FaEye, FaHeartbeat, FaUserMd, FaAmbulance, FaClock, FaAward } from 'react-icons/fa';
import '../styles.css';

const About = () => {
  return (
    <div className="content-wrapper">
      {/* Hero Section */}
      <div className="about-hero text-center text-white mb-5">
        <Container>
          <h1 className="display-4 fw-bold">Welcome to HMS</h1>
          <p className="lead">
            Providing compassionate care and advanced medical services since 2010.
          </p>
        </Container>
      </div>

      {/* Mission & Vision Section */}
      <Container>
        <Row className="mb-5">
          <Col md={6} className="mb-4">
            <Card className="h-100 shadow-sm border-0 about-card">
              <Card.Body className="text-center p-4">
                <div className="icon-box bg-primary text-white mb-3 mx-auto">
                  <FaBullseye size={30} />
                </div>
                <h3>Our Mission</h3>
                <p className="text-muted">
                  To provide exceptional, accessible, and cost-effective healthcare services to our community, 
                  focusing on patient safety and clinical excellence.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 shadow-sm border-0 about-card">
              <Card.Body className="text-center p-4">
                <div className="icon-box bg-success text-white mb-3 mx-auto">
                  <FaEye size={30} />
                </div>
                <h3>Our Vision</h3>
                <p className="text-muted">
                  To be the region's most trusted healthcare provider, pioneering medical innovations 
                  and setting the standard for quality patient care.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Why Choose Us / Features */}
        <h2 className="text-center mb-4 fw-bold">Why Choose Us?</h2>
        <Row className="mb-5">
          {[
            { icon: <FaUserMd />, title: "Expert Doctors", desc: "Highly qualified and experienced medical professionals.", color: "#0d6efd" },
            { icon: <FaHeartbeat />, title: "Advanced Care", desc: "State-of-the-art medical equipment and facilities.", color: "#dc3545" },
            { icon: <FaClock />, title: "24/7 Service", desc: "Round-the-clock emergency and patient support.", color: "#fd7e14" },
            { icon: <FaAward />, title: "Trusted Care", desc: "Over a decade of trust and community service.", color: "#198754" }
          ].map((item, idx) => (
            <Col md={3} sm={6} key={idx} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center feature-card">
                <Card.Body>
                  <div className="feature-icon mb-3" style={{ color: item.color }}>
                    {item.icon}
                  </div>
                  <h5>{item.title}</h5>
                  <p className="text-muted small">{item.desc}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default About;