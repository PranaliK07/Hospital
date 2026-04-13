// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Admissions from './pages/Admissions';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import Billing from './pages/Billing';
import Staff from './pages/Staff';
import Receptionists from './pages/Receptionists';
import Reports from './pages/Reports';
import PatientReports from './pages/PatientReports';
import PatientReportDetail from './pages/PatientReportDetail';
import DoctorReports from './pages/DoctorReports';
import DoctorReportDetail from './pages/DoctorReportDetail';
import BillingReports from './pages/BillingReports';
import BillingReportDetail from './pages/BillingReportDetail';
import AppointmentReports from './pages/AppointmentReports';
import AppointmentReportDetail from './pages/AppointmentReportDetail';
import StaffReports from './pages/StaffReports';
import StaffReportDetail from './pages/StaffReportDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import BusinessSettings from './pages/BusinessSettings';


// Services
import authService from './services/authService';
import accessService from './services/accessService';
import { expandAllowedRoutes } from './utils/accessUtils';

import './styles.css';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hmsUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [accessLoaded, setAccessLoaded] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('hmsTheme') || 'light');

  const loadAccess = async (currentUser = user) => {
    if (!currentUser) {
      setAllowedRoutes([]);
      setAccessLoaded(true);
      return;
    }
    try {
      const res = await accessService.getMyAccess();
      setAllowedRoutes(expandAllowedRoutes(res.allowedRoutes || []));
    } catch (err) {
      // Fallback: allow dashboard only to avoid lockout
      setAllowedRoutes(['/dashboard']);
      console.error('Failed to load access settings', err.response?.data || err.message);
    } finally {
      setAccessLoaded(true);
    }
  };

  useEffect(() => {
    loadAccess();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if (!user) return undefined;

    const refreshAccess = () => {
      loadAccess();
    };

    const handleStorage = (event) => {
      if (event.key === 'hmsAccessUpdatedAt') {
        refreshAccess();
      }
    };

    window.addEventListener('focus', refreshAccess);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('hms-access-updated', refreshAccess);

    return () => {
      window.removeEventListener('focus', refreshAccess);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('hms-access-updated', refreshAccess);
    };
  }, [user]);

  // apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hmsTheme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  // Login function using API
  const handleLogin = async (email, password) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      setAccessLoaded(false);
      await loadAccess(userData);
      return true; // Return success
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      throw error; // Throw error to handle in Login component
    }
  };

  // Register function using API
  const handleRegister = async (userData) => {
    try {
      await authService.register(userData);
      return true;
    } catch (error) {
      console.error("Registration failed:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setAllowedRoutes([]);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const PrivateRoute = ({ children }) => {
    return user ? children : <Navigate to="/" />;
  };

  const AllowedRoute = ({ path, element }) => {
    if (allowedRoutes.length && !allowedRoutes.includes(`/${path}`)) {
      return <Navigate to="/dashboard" />;
    }
    return element;
  };

  if (user && !accessLoaded) {
    return null; // simple loading gate to prevent flicker
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/register" 
          element={<Register onRegister={handleRegister} />} 
        />
        
        <Route path="/*" element={
          <PrivateRoute>
            <div className="d-flex">
              <Sidebar isOpen={isSidebarOpen} close={closeSidebar} allowedRoutes={allowedRoutes} />
              <main className="main-content" style={{ width: '100%' }}>
                <Navbar toggleSidebar={toggleSidebar} user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
                <Routes>
                  <Route path="dashboard" element={<AllowedRoute path="dashboard" element={<Dashboard />} />} />
                  <Route path="doctors" element={<AllowedRoute path="doctors" element={<Doctors />} />} />
                  <Route path="patients" element={<AllowedRoute path="patients" element={<Patients />} />} />
                  <Route path="admissions" element={<AllowedRoute path="admissions" element={<Admissions />} />} />
                  <Route path="appointments" element={<AllowedRoute path="appointments" element={<Appointments />} />} />
                  <Route path="book-appointment" element={<AllowedRoute path="book-appointment" element={<BookAppointment />} />} />
                  <Route path="billing" element={<AllowedRoute path="billing" element={<Billing />} />} />
                  <Route path="staff" element={<AllowedRoute path="staff" element={<Staff />} />} />
                  <Route path="receptionists" element={<AllowedRoute path="receptionists" element={<Receptionists />} />} />
                  <Route path="reports" element={<AllowedRoute path="reports" element={<Reports />} />} />
                  <Route path="patient-reports" element={<AllowedRoute path="patient-reports" element={<PatientReports />} />} />
                  <Route path="patient-reports/:id" element={<AllowedRoute path="patient-reports" element={<PatientReportDetail />} />} />
                  <Route path="doctor-reports" element={<AllowedRoute path="doctor-reports" element={<DoctorReports />} />} />
                  <Route path="doctor-reports/:id" element={<AllowedRoute path="doctor-reports" element={<DoctorReportDetail />} />} />
                  <Route path="billing-reports" element={<AllowedRoute path="billing-reports" element={<BillingReports />} />} />
                  <Route path="billing-reports/:id" element={<AllowedRoute path="billing-reports" element={<BillingReportDetail />} />} />
                  <Route path="appointment-reports" element={<AllowedRoute path="appointment-reports" element={<AppointmentReports />} />} />
                  <Route path="appointment-reports/:id" element={<AllowedRoute path="appointment-reports" element={<AppointmentReportDetail />} />} />
                  <Route path="staff-reports" element={<AllowedRoute path="staff-reports" element={<StaffReports />} />} />
                  <Route path="staff-reports/:id" element={<AllowedRoute path="staff-reports" element={<StaffReportDetail />} />} />
                  <Route path="about" element={<AllowedRoute path="about" element={<About />} />} />
                  <Route path="contact" element={<AllowedRoute path="contact" element={<Contact />} />} />
                  <Route path="business-settings" element={<AllowedRoute path="business-settings" element={<BusinessSettings />} />} />
                  <Route path="profile" element={<Profile user={user} />} />
                </Routes>
              </main>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
