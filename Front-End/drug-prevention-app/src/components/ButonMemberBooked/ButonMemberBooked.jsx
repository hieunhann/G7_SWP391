import React, { useState } from "react";
// import "./ButonMemberBooked.css";

const ButonMemberBooked = ({
  onCancel,
  consultant,
  status,
  name,
  email,
  phone_number,
  expertise,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const handleShow = () => setShowInfo(true);
  const handleClose = () => setShowInfo(false);

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={handleShow}>
        View Details
      </button>
      {showInfo && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 320,
              maxWidth: 400,
              boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
              position: "relative",
            }}
          >
            <h5>Consultant Information</h5>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li>
                <b>Name:</b> {name}
              </li>
              <li>
                <b>Email:</b> {email}
              </li>
              <li>
                <b>Phone:</b> {phone_number}
              </li>
              <li>
                <b>Expertise:</b> {expertise}
              </li>
              <li>
                <b>Status:</b> {status}
              </li>
            </ul>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {status === "Pending" && (
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    onCancel();
                    handleClose();
                  }}
                >
                  Cancel Appointment
                </button>
              )}
              <button className="btn btn-secondary" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ButonMemberBooked;
