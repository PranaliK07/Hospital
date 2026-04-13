// src/pages/BookAppointment.jsx
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaUserMd, FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import dataService from '../services/dataService';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [bookingData, setBookingData] = useState({ patientId: '', date: '', time: '', reason: '' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docs, pats] = await Promise.all([dataService.getDoctors(), dataService.getPatients()]);
        setDoctors(docs);
        setPatients(pats);
      } catch (err) {
        setError('Unable to load doctors or patients');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setShowForm(true);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    try {
      await dataService.createAppointment({
        patient: bookingData.patientId,
        doctor: selectedDoctor._id,
        date: bookingData.date,
        time: bookingData.time,
        status: 'scheduled',
        visitType: 'OPD',
        symptoms: bookingData.reason,
      });
      setSuccess(true);
      setTimeout(() => {
        setShowForm(false);
        setSelectedDoctor(null);
        setBookingData({ patientId: '', date: '', time: '', reason: '' });
      }, 1500);
    } catch (err) {
      alert('Failed to book appointment');
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

  return (
    <div className="content-wrapper">
      <h4 className="mb-4">Book an Appointment</h4>
      
      <Row>
        {doctors.map((doctor) => (
          <Col md={4} key={doctor._id} className="mb-4">
            <Card className="h-100 shadow-sm doctor-card">
              <Card.Body className="text-center p-4">
                <div className="doctor-avatar mb-3">
                  <FaUserMd size={40} className="text-primary" />
                </div>
                <h5>{doctor.user?.name || 'Doctor'}</h5>
                <p className="text-muted mb-1">{doctor.specialty}</p>
                <small className="d-block mb-3 text-success">
                  <FaCalendarAlt className="me-1" /> {doctor.availability}
                </small>
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  Book Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Appointment with {selectedDoctor?.user?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {success ? (
            <div className="text-center p-4">
              <FaCheckCircle size={50} className="text-success mb-3" />
              <h5>Booking Confirmed!</h5>
              <p className="text-muted">Your appointment has been scheduled.</p>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Your Name</Form.Label>
                <Form.Select 
                  required 
                  value={bookingData.patientId}
                  onChange={(e) => setBookingData({...bookingData, patientId: e.target.value})}
                >
                  <option value="">Select Patient...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.user?.name || p._id}</option>)}
                </Form.Select>
              </Form.Group>
              
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label><FaCalendarAlt className="me-1" /> Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      required
                      value={bookingData.date}
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label><FaClock className="me-1" /> Time</Form.Label>
                    <Form.Control 
                      type="time" 
                      required
                      value={bookingData.time}
                      onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Reason for Visit</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2} 
                  placeholder="Describe symptoms..."
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                />
              </Form.Group>

              <div className="d-grid">
                <Button variant="primary" type="submit">Confirm Booking</Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BookAppointment;
