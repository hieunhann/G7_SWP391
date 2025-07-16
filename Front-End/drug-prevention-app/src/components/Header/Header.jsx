import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/features/userSlice";
import { persistor } from "../../redux/store";
import "./Header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.user?.user);

  const handleLogout = async () => {
    dispatch(logout()); // reset Redux
    await persistor.purge(); // xóa persisted state
    localStorage.clear(); // xóa toàn bộ localStorage
    navigate("/");
  };

  const renderUserName = () => {
    if (!currentUser) return null;
    const { firstName = "", lastName = "" } = currentUser;
    return `${firstName} ${lastName}`.trim() || "User";
  };

  const navItems = [
    { to: "/", label: "Trang Chủ", roles:["manager", "consultant", "member", "staff"]},
    { to: "/courses", label: "Khóa Học" , roles:["manager", "consultant", "member", "staff"]},
    { to: "/Surveys", label: "Khảo Sát" , roles:["manager", "consultant", "member"]},
    { to: "/booking", label: "Đặt Lịch" , roles:["manager", "consultant", "member", "staff"]},
    { to: "/booked", label: "Lịch Của Tôi" , roles:["manager", "consultant", "member", "staff"]},
    { to: "/ViewCommunicationPrograms", label: "Chương Trình Truyền Thông" , roles:["manager", "consultant", "member", "staff"]},
    { to: "/ScheduleManager", label: "Quản Lý" , roles:["manager"]},
    { to: "/blogs", label: "Bài Viết" , roles:["manager", "consultant", "member", "staff"]},
  ];

  return (
    <div className="header-container">
      <div className="title">
        <div>Drug Use Prevention</div>
        <div className="subtitle">Support System</div>
      </div>

      <button
        className={`hamburger${menuOpen ? " active" : ""}`}
        aria-label="Toggle menu"
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`nav-links${menuOpen ? " show" : ""}`}>
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-items${isActive ? " active-item" : ""}`
            }
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </NavLink>
        ))}

        {currentUser ? (
          <>
            <NavLink
              to="/UserProfile"
              className="nav-items user-name"
              onClick={() => setMenuOpen(false)}
              style={{ textDecoration: "none", cursor: "pointer" }}
            >
              Xin chào, {renderUserName()}
            </NavLink>
            <button
              className="nav-items logout-button"
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
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
