import { useState } from "react";
import React from "react";
import "./ButonMemberBooked.css";
// import { useState } from "react";
const ButonMemberBooked = () => {
  return (
    <div
      className="btn-group"
      role="group"
      aria-label="Basic mixed styles example"
    >
      <button type="button-Cancel" className="btn btn-danger">
        Cancel
      </button>
      <button type="button-info" className="btn btn-warning">
        Information
      </button>
      <a
        href="https://meet.google.com/tsz-wonp-xjr?pli=1&authuser=2"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-success"
      
      >
        Meeting
      </a>
    </div>
  );
};
export default ButonMemberBooked;
