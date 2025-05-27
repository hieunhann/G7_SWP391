import { useState } from "react";
import React from "react";
import "./Header.css";
import { Link, NavLink } from "react-router-dom";
// import { useState } from "react";
const Header = () => {
  return (
    <div className="header-container">
      <div className="title">Drug Use Prevention Support System</div>
      <div className="nav-links">
        <NavLink className="nav-items">Home</NavLink>
        {/* //NavLink là viết tắt của navigation Link, nó sẽ tự động thêm class active-item 
        // nếu đường dẫn hiện tại khớp với đường dẫn của NavLink */}
        <NavLink className="nav-items">Khoa hoc</NavLink>
        <NavLink className="nav-items">Khao sat</NavLink>
        <NavLink className="nav-items">Dat Lich</NavLink>
        <NavLink
          className={({isActive}) => {
            return `nav-items ${isActive ? "active-item" : ""}`;
          }}
          to={"/booked-consultations"}
        >
          Lịch của tôi
        </NavLink>
        <NavLink className="nav-items">Dang xuat</NavLink>
      </div>
    </div>
  );
};
export default Header;
