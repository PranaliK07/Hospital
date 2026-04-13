// src/components/Navbar.jsx
import React from 'react';
import { FaBars, FaBell, FaUserCircle, FaSignOutAlt, FaCalendarCheck, FaDollarSign, FaMoon, FaSun } from 'react-icons/fa';
import { Dropdown, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles.css';

const Navbar = ({ toggleSidebar, user, onLogout, theme = 'light', onToggleTheme }) => {
  // Dummy notifications for the dropdown
  const notifications = [
    { id: 1, text: "New appointment booked", time: "5 mins ago", icon: <FaCalendarCheck className="text-success" /> },
    { id: 2, text: "Payment received: $250", time: "1 hour ago", icon: <FaDollarSign className="text-primary" /> },
    { id: 3, text: "Server maintenance", time: "2 hours ago", icon: <FaBell className="text-warning" /> },
  ];

  return (
    <div className="top-navbar">
      <div className="d-flex align-items-center">
        {/* Mobile Toggle Button */}
        <Button 
          variant="link" 
          className="me-3 p-0 border-0 d-md-none" 
          onClick={toggleSidebar}
          style={{ textDecoration: 'none' }}
        >
          <FaBars size={24} color="#333" />
        </Button>
        
        <h4 className="mb-0">HealthCare Clinic</h4>
      </div>
      
      <div className="d-flex align-items-center">
        <Button
          variant="outline-secondary"
          className="me-3"
          onClick={onToggleTheme}
          title="Toggle theme"
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </Button>
        
        {/* --- NOTIFICATION DROPDOWN (Functional) --- */}
        <Dropdown align="end" className="me-3">
          <Dropdown.Toggle variant="link" className="p-0 text-dark position-relative" style={{ textDecoration: 'none', background: 'transparent', border: 'none' }}>
            <FaBell size={20} />
            <Badge 
              pill 
              bg="danger" 
              className="position-absolute top-0 start-100 translate-middle" 
              style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem' }}
            >
              {notifications.length}
            </Badge>
          </Dropdown.Toggle>

          <Dropdown.Menu style={{ minWidth: '300px', padding: '0' }}>
            <Dropdown.Header className="bg-light fw-bold py-2">Notifications</Dropdown.Header>
            
            {notifications.map((notif) => (
              <Dropdown.Item key={notif.id} className="py-2 border-bottom">
                <div className="d-flex align-items-center">
                  <div className="me-3 fs-5">{notif.icon}</div>
                  <div>
                    <p className="mb-0 fw-medium">{notif.text}</p>
                    <small className="text-muted">{notif.time}</small>
                  </div>
                </div>
              </Dropdown.Item>
            ))}
            
            <Dropdown.Item className="text-center text-primary py-2 bg-light">
              View All Notifications
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {/* User Profile Dropdown */}
        <Dropdown>
          <Dropdown.Toggle variant="light" id="dropdown-basic" className="d-flex align-items-center border-0 bg-transparent">
            <FaUserCircle className="me-2" size={24} />
            <span className="d-none d-md-inline">{user?.name || 'User'}</span>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
            <Dropdown.Divider />
            {/* --- RED LOGOUT BUTTON --- */}
            <Dropdown.Item onClick={onLogout} className="text-danger fw-bold d-flex align-items-center">
              <FaSignOutAlt className="me-2" /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navbar;
