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
        console.error("Error parsing user data from localStorage", error);
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
       <NavLink to="/" className={({ isActive }) => `nav-items ${isActive ? "active-item" : ""}`}>Home</NavLink>
<NavLink to="/Courses" className={({ isActive }) => `nav-items ${isActive ? "active-item" : ""}`}>Courses</NavLink>
<NavLink to="/surveys" className={({ isActive }) => `nav-items ${isActive ? "active-item" : ""}`}>Surveys</NavLink>
<NavLink to="/booking" className={({ isActive }) => `nav-items ${isActive ? "active-item" : ""}`}>Book Appointment</NavLink>
<NavLink to="/MyBooking" className={({ isActive }) => `nav-items ${isActive ? "active-item" : ""}`}>My Schedule</NavLink>


        {user ? (
          <>
          <NavLink to="/UserProfile" className="nav-items user-name" title="View Profile">
            Welcome, {<span className="fullName">{user.fullName || user.name || user.username || "User"}</span>}
          </NavLink>

            <button className="nav-items logout-button" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
           <NavLink to="/login" className={({ isActive }) => `nav-items ${isActive ? "active-item" : ""}`}>Sign In</NavLink>
<NavLink to="/register" className={({ isActive }) => `nav-items ${isActive ? "active-item" : ""}`}>Sign Up</NavLink>

          </>
        )}
      </div>
    </div>
  );
};

export default Header;
