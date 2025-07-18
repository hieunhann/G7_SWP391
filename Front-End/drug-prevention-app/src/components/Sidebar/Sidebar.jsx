import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaGraduationCap,
  FaUser,
  FaBlog,
  FaCogs,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/features/userSlice";
import { persistor } from "../../redux/store";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const commonMenu = [
  ];

  const consultantMenu = [
    { to: "/booked", label: "Lịch hẹn", icon: <FaCalendarAlt /> },
    { to: "/UserProfile", label: "Hồ sơ cá nhân", icon: <FaUser /> },

  ];

  const managerMenu = [
    { to: "/", label: "Trang chủ", icon: <FaHome /> },
    { to: "/blogs", label: "Quản lý bài viết", icon: <FaBlog /> },
    { to: "/viewcommunicationprograms", label: "Quản lý chương trình", icon: <FaCogs /> },
    { to: "/manage-courses", label: "Quản lý khóa học", icon: <FaGraduationCap /> },
    { to: "/ScheduleManager", label: "Quản lý Lịch", icon: <FaCalendarAlt /> },
    { to: "/user-manager", label: "Quản lý Nhân sự", icon: <FaUsers /> },
    { to: "/stats", label: "Thống kê", icon: <FaChartBar /> },
    { to: "/UserProfile", label: "Hồ sơ cá nhân", icon: <FaUser /> },

  ];

  const handleLogout = async () => {
    dispatch(logout());
    await persistor.purge();
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  let menu = [...commonMenu];
  if (role === "CONSULTANT") {
    menu = [...menu, ...consultantMenu];
  } else if (role === "MANAGER") {
    menu = [...menu, ...managerMenu];
  }
  if (!user || role === "MEMBER") {
    return null;
  }
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">Drug Prevention</div>
      <ul className="sidebar-menu">
        {menu.map((item) => (
          <li
            key={item.to}
            className={location.pathname === item.to ? "active" : ""}
          >
            <Link to={item.to}>
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          </li>
        ))}

        <li>
          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span className="sidebar-icon">
              <FaSignOutAlt />
            </span>
            <span className="sidebar-label">Đăng xuất</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
