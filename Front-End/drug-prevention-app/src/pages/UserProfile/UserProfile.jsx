import React, { useEffect, useState } from "react";

const iconColor = "#004b8d";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [certificates, setCertificates] = useState([]);
  const [showCertificates, setShowCertificates] = useState(false);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [certificatesError, setCertificatesError] = useState("");

  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setFormData(parsedUser);
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user?.id || !showCertificates) return;

      if (user.role?.toLowerCase() !== "consultant") return;

      setCertificatesLoading(true);
      setCertificatesError("");

      try {
        const res = await fetch(`http://localhost:5002/Certificates?consultantId=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch certificates");
        const data = await res.json();
        setCertificates(data);
      } catch (error) {
        setCertificatesError(error.message || "Error loading certificates");
      } finally {
        setCertificatesLoading(false);
      }
    };

    fetchCertificates();
  }, [user, showCertificates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 5000);
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditing(false);
    showToast("Information has been updated.");
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
    if (oldPassword !== user?.password) {
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
    showToast("Password has been changed successfully.");
  };

  if (!user) {
    return <p className="text-center my-5">Loading user information...</p>;
  }

  const isConsultant = user.role?.toLowerCase() === "consultant";

  return (
    <>
      <div className="container my-5">
        <div className="card shadow mx-auto" style={{ maxWidth: "600px" }}>
          <div className="card-body">
            <h2 className="card-title mb-4 text-center" style={{ color: iconColor }}>
              Personal Details
            </h2>

            <div className="text-center mb-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 120,
                  height: 120,
                  background: "#e3e6ea",
                  color: "#004b8d",
                  fontSize: 48,
                  fontWeight: "bold",
                  userSelect: "none",
                  margin: "0 auto"
                }}
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              {[
                { id: "fullName", label: "Full Name", type: "text" },
                { id: "username", label: "Username", type: "text", readOnly: true },
                { id: "email", label: "Email", type: "email" },
                { id: "phoneNumber", label: "Phone Number", type: "tel" },
                { id: "dateOfBirth", label: "Date of Birth", type: "date" },
              ].map(({ id, label, type, readOnly }) => (
                <div className="mb-3" key={id}>
                  <label htmlFor={id} className="form-label d-flex align-items-center justify-content-center gap-2" style={{ color: iconColor, fontSize: "1.2rem", fontWeight: 500 }}>
                    <i className={`bi bi-${id === "email" ? "envelope" : id === "phoneNumber" ? "telephone" : id === "dateOfBirth" ? "calendar2-week" : id === "username" ? "person" : "pencil-square"}`} style={{ fontSize: "1.4rem" }}></i>
                    {label}:
                  </label>
                  <input
                    id={id}
                    name={id}
                    type={type}
                    value={formData[id] || ""}
                    onChange={handleChange}
                    className="form-control text-center"
                    disabled={!editing || readOnly}
                    readOnly={readOnly}
                  />
                </div>
              ))}

              <div className="d-flex justify-content-center gap-3 mb-3 flex-wrap">
                {editing ? (
                  <>
                    <button type="button" className="btn btn-outline-primary" onClick={handleSave}>
                      Save
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => {
                      setEditing(false);
                      setFormData(user);
                    }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-outline-primary" onClick={() => setEditing(true)}>
                      Edit Profile
                    </button>
                    <button type="button" className="btn btn-outline-primary" onClick={openPasswordModal}>
                      Change Password
                    </button>
                    {isConsultant && (
                      <button type="button" className="btn btn-outline-primary" onClick={() => setShowCertificates(true)}>
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

      {/* Certificates Modal */}
      {showCertificates && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: iconColor, color: "#fff", justifyContent: "center" }}>
                <h5 className="modal-title">Certificates</h5>
                <button type="button" className="btn-close" style={{ filter: "invert(1)" }} onClick={() => setShowCertificates(false)} aria-label="Close" />
              </div>
              <div className="modal-body text-center">
                {certificatesLoading && <p>Loading certificates...</p>}
                {certificatesError && <p className="text-danger">{certificatesError}</p>}
                {!certificatesLoading && certificates.length === 0 && <p>No certificates found.</p>}
                <ul className="list-group mx-auto" style={{ maxWidth: 400 }}>
                  {certificates.map((cert) => (
                    <li key={cert.id} className="list-group-item">
                      <strong>Issuer:</strong> {cert.issuer}<br />
                      <strong>Issued Date:</strong> {cert.issuedDate}<br />
                      <strong>Expiration Date:</strong> {cert.expirationDate}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn" style={{ background: iconColor, color: "#fff", minWidth: 100 }} onClick={() => setShowCertificates(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>
                <button type="button" className="btn-close" onClick={closePasswordModal} aria-label="Close" />
              </div>
              <div className="modal-body">
                {passwordError && <div className="alert alert-danger">{passwordError}</div>}
                {[
                  { id: "oldPassword", label: "Current Password", value: oldPassword, setValue: setOldPassword },
                  { id: "newPassword", label: "New Password", value: newPassword, setValue: setNewPassword },
                  { id: "confirmPassword", label: "Confirm New Password", value: confirmPassword, setValue: setConfirmPassword },
                ].map(({ id, label, value, setValue }) => (
                  <div className="mb-3" key={id}>
                    <label htmlFor={id} className="form-label text-center d-block">{label}</label>
                    <input
                      type="password"
                      id={id}
                      className="form-control text-center"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-outline-secondary" onClick={closePasswordModal}>Cancel</button>
                <button className="btn btn-outline-primary" onClick={handlePasswordSubmit}>Save Password</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            minWidth: 250,
            maxWidth: 350,
          }}
          className="alert alert-success text-center shadow"
        >
          {toast.message}
        </div>
      )}
    </>
  );
};

export default UserProfile;
