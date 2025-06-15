import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // trạng thái mở menu
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    } catch {
      console.error("Invalid user data in localStorage");
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const renderUserName = () => {
    if (!user) return null;
    return user.fullname || user.name || user.username || "User";
  };

  const navItems = [
    { to: "/", label: "Trang Chủ" },
    { to: "/courses", label: "Khóa Học" },
    { to: "/Surveys", label: "Khảo Sát" },
    { to: "/booking", label: "Đặt Lịch" },
    { to: "/MyBooking", label: "Lịch Của Tôi" },
    { to: "/CommunityActivities", label: "Hoạt động cộng đồng" },
    // { to: "/view-booked-members", label: "Xem Thành Viên Đặt Lịch" },
    // { to: "/Schedule-Manager", label: "Quản Lý Lịch" },
  ];

  // Toggle hamburger menu
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className="header-container">
      <div className="title">
        <div>Drug Use Prevention</div>
        <div className="subtitle">Support System</div>
      </div>

      {/* Hamburger button */}
      <button
        className={`hamburger${menuOpen ? " active" : ""}`}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={toggleMenu}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Navigation */}
      <nav className={`nav-links${menuOpen ? " show" : ""}`}>
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-items${isActive ? " active-item" : ""}`
            }
            onClick={() => setMenuOpen(false)} // đóng menu khi click nav link
          >
            {label}
          </NavLink>
        ))}

        {user ? (
          <>
            <NavLink
              to="/UserProfile"
              className="nav-items user-name"
              onClick={() => setMenuOpen(false)}
              style={{ cursor: "pointer", textDecoration: "none" }}
            >
              Xin chào, {renderUserName()}
            </NavLink>
            <button
              className="nav-items logout-button"
              onClick={() => {
                handleLogout();
                setMenuOpen(false); // đóng menu khi logout
              }}
            >
              Đăng Xuất
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `nav-items${isActive ? " active-item" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              Đăng Nhập
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `nav-items${isActive ? " active-item" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              Đăng Ký
            </NavLink>
          </>
        )}
      </nav>
    </div>
  );
};

export default Header;