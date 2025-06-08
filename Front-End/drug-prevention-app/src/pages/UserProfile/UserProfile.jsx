import React, { useEffect, useState } from "react";
const iconColor = "#004b8d";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);

  // Password modal states
  const [showModal, setShowModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Certificates popup states
  const [certificates, setCertificates] = useState([]);
  const [showCertificates, setShowCertificates] = useState(false);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [certificatesError, setCertificatesError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData(parsedUser);
    }
  }, []);

  // Fetch certificates only if user is Consultant and showCertificates = true
  useEffect(() => {
    if (
      user &&
      (user.role === "Consultant" || user.role === "consultant") &&
      showCertificates &&
      user.id
    ) {
      setCertificatesLoading(true);
      setCertificatesError("");
      fetch("http://localhost:5002/Certificates?consultantId=" + user.id)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch certificates");
          return res.json();
        })
        .then((data) => {
          // Nếu server trả về mảng certificates, không cần filter nữa
          setCertificates(data);
          setCertificatesLoading(false);
        })
        .catch((err) => {
          setCertificatesError(err.message || "Error loading certificates");
          setCertificatesLoading(false);
        });
    }
  }, [user, showCertificates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditing(false);
    alert("Information has been updated.");
  };

  const openPasswordModal = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowModal(true);
  };

  const closePasswordModal = () => {
    setShowModal(false);
    setPasswordError("");
  };

  const handlePasswordSubmit = () => {
    if (oldPassword !== user.password) {
      setPasswordError("Incorrect current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    const updatedUser = { ...user, password: newPassword };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setFormData((prev) => ({ ...prev, password: newPassword }));
    closePasswordModal();
    alert("Password has been changed successfully.");
  };

  if (!user) return <p className="text-center my-5">Loading user information...</p>;

  return (
    <>
      <div className="container my-5">
        <div className="card shadow mx-auto" style={{ maxWidth: "600px" }}>
          <div className="card-body">
            <h2 className="card-title mb-4 text-center" style={{ color: iconColor }}>
              Personal Details
            </h2>

            <div className="text-center mb-4">
              <img
                src={user.avatar || "/avatars/default.jpg"}
                alt="User avatar"
                className="rounded-circle"
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editing) handleSave();
              }}
            >
              {/* Full Name */}
              <div className="mb-3">
                <label
                  htmlFor="fullName"
                  className="form-label d-flex align-items-center justify-content-center gap-2"
                  style={{ color: iconColor, fontSize: "1.2rem", fontWeight: 500 }}
                >
                  <i className="bi bi-pencil-square" style={{ color: iconColor, fontSize: "1.4rem" }}></i>
                  Full Name:
                </label>
                <input
                  type="text"
                  id="fullName"
                  className="form-control text-center"
                  name="fullName"
                  value={formData.fullName || ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              {/* Username */}
              <div className="mb-3">
                <label
                  htmlFor="username"
                  className="form-label d-flex align-items-center justify-content-center gap-2"
                  style={{ color: iconColor, fontSize: "1.2rem", fontWeight: 500 }}
                >
                  <i className="bi bi-person" style={{ color: iconColor, fontSize: "1.4rem" }}></i>
                  Username:
                </label>
                <input
                  type="text"
                  id="username"
                  className="form-control text-center"
                  name="username"
                  value={formData.username || ""}
                  disabled
                  readOnly
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label
                  htmlFor="email"
                  className="form-label d-flex align-items-center justify-content-center gap-2"
                  style={{ color: iconColor, fontSize: "1.2rem", fontWeight: 500 }}
                >
                  <i className="bi bi-envelope" style={{ color: iconColor, fontSize: "1.4rem" }}></i>
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control text-center"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              {/* Phone Number */}
              <div className="mb-3">
                <label
                  htmlFor="phoneNumber"
                  className="form-label d-flex align-items-center justify-content-center gap-2"
                  style={{ color: iconColor, fontSize: "1.2rem", fontWeight: 500 }}
                >
                  <i className="bi bi-telephone" style={{ color: iconColor, fontSize: "1.4rem" }}></i>
                  Phone Number:
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  className="form-control text-center"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              {/* Date of Birth */}
              <div className="mb-3">
                <label
                  htmlFor="dateOfBirth"
                  className="form-label d-flex align-items-center justify-content-center gap-2"
                  style={{ color: iconColor, fontSize: "1.2rem", fontWeight: 500 }}
                >
                  <i className="bi bi-calendar2-week" style={{ color: iconColor, fontSize: "1.4rem" }}></i>
                  Date of Birth:
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  className="form-control text-center"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="d-flex justify-content-center gap-3 mb-3 flex-wrap">
                {editing ? (
                  <>
                    <button type="submit" className="btn btn-outline-primary">
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setEditing(false);
                        setFormData(user); // reset form data if cancel
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => setEditing(true)}
                    >
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={openPasswordModal}
                    >
                      Change Password
                    </button>

                    {(user.role === "Consultant" || user.role === "consultant") && (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => setShowCertificates(true)}
                      >
                        Certificates
                      </button>
                    )}
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Certificates Popup */}
      {showCertificates && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div
                className="modal-header"
                style={{ background: "#004b8d", color: "#fff", justifyContent: "center" }}
              >
                <h5 className="modal-title w-100 text-center" style={{ color: "#fff" }}>
                  Certificates
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  style={{ filter: "invert(1)" }}
                  onClick={() => setShowCertificates(false)}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body d-flex flex-column align-items-center justify-content-center">
                {certificatesLoading && <p>Loading certificates...</p>}
                {certificatesError && <p className="text-danger">{certificatesError}</p>}
                {!certificatesLoading && certificates.length === 0 && (
                  <p>No certificates found.</p>
                )}
                <ul className="list-group w-100" style={{ maxWidth: 400 }}>
                  {certificates.map((cert) => (
                    <li
                      key={cert.id}
                      className="list-group-item text-center"
                      style={{ borderColor: "#004b8d" }}
                    >
                      <strong>Issuer:</strong> {cert.issuer} <br />
                      <strong>Issued Date:</strong> {cert.issuedDate} <br />
                      <strong>Expiration Date:</strong> {cert.expirationDate}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer justify-content-center">
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: "#004b8d",
                    color: "#fff",
                    minWidth: 100,
                    fontWeight: 500,
                  }}
                  onClick={() => setShowCertificates(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closePasswordModal}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                {passwordError && <div className="alert alert-danger">{passwordError}</div>}

                <div className="mb-3">
                  <label htmlFor="oldPassword" className="form-label text-center d-block">
                    Current Password
                  </label>
                  <input
                    id="oldPassword"
                    type="password"
                    className="form-control text-center"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label text-center d-block">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="form-control text-center"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label text-center d-block">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-control text-center"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer justify-content-center">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closePasswordModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handlePasswordSubmit}
                >
                  Save Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
