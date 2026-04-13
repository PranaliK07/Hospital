// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHospital, FaUsers, FaUserMd, FaProcedures, FaCalendarCheck, 
  FaFileInvoiceDollar, FaChartBar, FaInfoCircle, FaEnvelope,
  FaUserTie, FaCalendarPlus, FaTimes, FaCog, FaHospitalUser
} from 'react-icons/fa';
import '../styles.css';
import { accessMenuItems } from '../config/accessMenuItems';
import { getSidebarRoutes } from '../utils/accessUtils';

const iconMap = {
  '/dashboard': <FaUsers />,
  '/book-appointment': <FaCalendarPlus />,
  '/appointments': <FaCalendarCheck />,
  '/doctors': <FaUserMd />,
  '/receptionists': <FaUserTie />,
  '/patients': <FaProcedures />,
  '/admissions': <FaHospitalUser />,
  '/billing': <FaFileInvoiceDollar />,
  '/reports': <FaChartBar />,
  '/patient-reports': <FaChartBar />,
  '/doctor-reports': <FaChartBar />,
  '/billing-reports': <FaChartBar />,
  '/appointment-reports': <FaChartBar />,
  '/staff-reports': <FaChartBar />,
  '/staff': <FaUsers />,
  '/business-settings': <FaCog />,
  '/about': <FaInfoCircle />,
  '/contact': <FaEnvelope />,
};

const menuItems = accessMenuItems.map((item) => ({
  ...item,
  icon: iconMap[item.to],
}));

const Sidebar = ({ isOpen, close, allowedRoutes = [] }) => {
  const sidebarRoutes = getSidebarRoutes(allowedRoutes);

  const visibleItems = sidebarRoutes.length
    ? menuItems.filter((item) => sidebarRoutes.includes(item.to))
    : menuItems; // fallback (should not happen after access load)

  return (
    <>
      {/* Overlay Background (Visible on mobile when open) */}
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={close}></div>
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <FaHospital /> HMS
          {/* Close Button (X) - Visible on mobile */}
          <button className="sidebar-close-btn d-md-none" onClick={close}>
            <FaTimes />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {visibleItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link" onClick={close}>
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
