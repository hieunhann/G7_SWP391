import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUsers, FaChartBar, FaSignOutAlt ,FaGraduationCap  } from 'react-icons/fa';
import './Sidebar.css';

const menu = [
  { to: '/', label: 'Trang chủ', icon: <FaHome /> },
  { to: '/ScheduleManager', label: 'Quản lý lịch', icon: <FaCalendarAlt /> },
  { to: '/stats', label: 'Thống kê', icon: <FaChartBar /> },
  { to: '/manage-courses', label: 'Quản Lý Khóa Học', icon: <FaGraduationCap /> }, // Placeholder for settings
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">Drug Prevention</div>
      <ul className="sidebar-menu">
        {menu.map(item => (
          <li key={item.to} className={location.pathname === item.to ? 'active' : ''}>
            <Link to={item.to}>
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          </li>
        ))}
        <li>
          <button className="sidebar-logout" onClick={() => {
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}>
            <span className="sidebar-icon"><FaSignOutAlt /></span>
            <span className="sidebar-label">Đăng xuất</span>
          </button>
        </li>
      </ul>
    </nav>
  );
} 