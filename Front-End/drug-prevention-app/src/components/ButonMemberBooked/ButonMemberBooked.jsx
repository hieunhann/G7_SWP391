import React from "react";
import "./ButonMemberBooked.css";

const ButonMemberBooked = ({
  onCancel,
  consultant,
  consultationName,
  time,
  status,
  name,
  email,
  phone_number,
  expertise,
}) => {
  const handleCancelClick = () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      onCancel();
    }
  };

  const handleInfoClick = () => {
    alert(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone_number}\nExpertise: ${expertise}`
    );
  };

  return (
    <div
      className="btn-group"
      role="group"
      aria-label="Basic mixed styles example"
    >
      <button
        type="button"
        className="btn btn-danger btn-cancel"
        onClick={handleCancelClick}
      >
        Cancel
      </button>
      <button
        type="button"
        className="btn btn-warning btn-information"
        onClick={handleInfoClick}
      >
        Information
      </button>
      <a
        href="https://meet.google.com/tsz-wonp-xjr?pli=1&authuser=2"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-success btn-meeting"
      >
        Meeting
      </a>
    </div>
  );
};

export default ButonMemberBooked;
