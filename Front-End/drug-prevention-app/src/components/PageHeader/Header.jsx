import React, { useState, useEffect } from "react";
import "./Header.css";
import { NavLink, useNavigate } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Loaded user:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Invalid user data in localStorage");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="header-container">
      <div className="title">Drug Use Prevention Support System</div>
      <div className="nav-links">
        <NavLink className="nav-items" to="/">
          Home
        </NavLink>
        <NavLink className="nav-items" to="/courses">
          Courses
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `nav-items ${isActive ? "active-item" : ""}`
          }
          to="/Surveys"
        >
          Surveys
        </NavLink>

        <NavLink className="nav-items" to="/booking">
          Book Appointment
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `nav-items ${isActive ? "active-item" : ""}`
          }
          to="/booked-consultations"
        >
          My Schedule
        </NavLink>

        {user ? (
          <>
            <span className="nav-items user-name">
              Welcome, {user.fullname || user.name || user.username || "User"}
            </span>
            <button className="nav-items logout-button" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <NavLink
              className={({ isActive }) =>
                `nav-items ${isActive ? "active-item" : ""}`
              }
              to="/login"
            >
              Sign In
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `nav-items ${isActive ? "active-item" : ""}`
              }
              to="/register"
            >
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
