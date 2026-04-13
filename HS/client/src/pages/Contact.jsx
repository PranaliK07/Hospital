// src/pages/Contact.jsx
import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane } from 'react-icons/fa';
import '../styles.css';

const Contact = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="content-wrapper">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-bold">Get In Touch</h2>
          <p className="text-muted">Have questions? We'd love to hear from you.</p>
        </div>

        <Row className="align-items-stretch">
          {/* Contact Info Column */}
          <Col lg={5} className="mb-4 mb-lg-0">
            <Card className="h-100 contact-info-card text-white">
              <Card.Body className="p-5 d-flex flex-column justify-content-center">
                <h3 className="mb-5 font-weight-bold">Contact Information</h3>
                
                <div className="d-flex align-items-center mb-4">
                  <div className="contact-icon-circle me-3">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h6 className="mb-0">Address</h6>
                    <small> Medical Center, Baramati</small>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-4">
                  <div className="contact-icon-circle me-3">
                    <FaPhone />
                  </div>
                  <div>
                    <h6 className="mb-0">Phone</h6>
                    <small>+1 234 567 890</small>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-4">
                  <div className="contact-icon-circle me-3">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h6 className="mb-0">Email</h6>
                    <small>support@hmsportal.com</small>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <div className="contact-icon-circle me-3">
                    <FaClock />
                  </div>
                  <div>
                    <h6 className="mb-0">Working Hours</h6>
                    <small>Mon - Fri: 08:00 AM - 10:00 PM</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Contact Form Column */}
          <Col lg={7}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-5">
                {sent && <Alert variant="success">Message sent successfully! We will get back to you soon.</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Your Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter Your Name" required className="form-control-lg" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Your Email</Form.Label>
                        <Form.Control type="email" placeholder="Enter Your Email" required className="form-control-lg" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control type="text" placeholder="How can we help?" required className="form-control-lg" />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Message</Form.Label>
                    <Form.Control as="textarea" rows={5} placeholder="Your message..." required className="form-control-lg" />
                  </Form.Group>
                  <div className="d-grid">
                    <Button variant="primary" type="submit" size="lg" className="d-flex align-items-center justify-content-center">
                      <FaPaperPlane className="me-2" /> Send Message
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contact;