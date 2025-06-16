import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { Modal } from "react-bootstrap";
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [editedUser, setEditedUser] = useState(null);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setFormData(parsedUser);
      }
    } catch (error) {
      console.error("Không thể tải người dùng từ localStorage", error);
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
        if (!res.ok) throw new Error("Không thể lấy chứng nhận");
        const data = await res.json();
        setCertificates(data);
      } catch (error) {
        setCertificatesError(error.message || "Lỗi khi tải chứng nhận");
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
    showToast("Thông tin đã được cập nhật.");
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
      setPasswordError("Mật khẩu hiện tại không đúng.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp.");
      return;
    }

    const updatedUser = { ...user, password: newPassword };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setFormData((prev) => ({ ...prev, password: newPassword }));
    closePasswordModal();
    showToast("Mật khẩu đã được thay đổi thành công.");
  };

  const handleUpdateProfile = () => {
    const updatedUser = { ...user, ...editedUser };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowEditModal(false);
    showToast("Thông tin đã được cập nhật.");
  };

  const handleChangePassword = () => {
    if (passwordData.currentPassword !== user?.password) {
      setPasswordError("Mật khẩu hiện tại không đúng.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp.");
      return;
    }

    const updatedUser = { ...user, password: passwordData.newPassword };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowChangePasswordModal(false);
    showToast("Mật khẩu đã được thay đổi thành công.");
  };

  if (!user) {
    return <p className="text-center my-5">Đang tải thông tin người dùng...</p>;
  }

  const isConsultant = user.role?.toLowerCase() === "consultant";

  return (
    <>
      <Header />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title text-center mb-4">
                  Thông tin cá nhân
                </h2>

                <div className="text-center mb-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                    style={{
                      width: '120px',
                      height: '120px',
                      background: 'var(--light-color)',
                      color: 'var(--primary-color)',
                      fontSize: '48px',
                      fontWeight: 'bold',
                      userSelect: 'none'
                    }}
                  >
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.fullName || ""}
                    readOnly
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={user.email || ""}
                    readOnly
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={user.phone || ""}
                    readOnly
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Địa chỉ</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.address || ""}
                    readOnly
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowEditModal(true)}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Chỉnh sửa thông tin
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowChangePasswordModal(true)}
                  >
                    <i className="bi bi-key me-2"></i>
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label className="form-label">Họ và tên</label>
              <input
                type="text"
                className="form-control"
                value={editedUser?.fullName}
                onChange={(e) => setEditedUser({ ...editedUser, fullName: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className="form-control"
                value={editedUser?.phone}
                onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Địa chỉ</label>
              <input
                type="text"
                className="form-control"
                value={editedUser?.address}
                onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowEditModal(false)}
          >
            Hủy
          </button>
          <button className="btn btn-primary" onClick={handleUpdateProfile}>
            Lưu thay đổi
          </button>
        </Modal.Footer>
      </Modal>

      {/* Change Password Modal */}
      <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Đổi mật khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label className="form-label">Mật khẩu hiện tại</label>
              <input
                type="password"
                className="form-control"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowChangePasswordModal(false)}
          >
            Hủy
          </button>
          <button className="btn btn-primary" onClick={handleChangePassword}>
            Đổi mật khẩu
          </button>
        </Modal.Footer>
      </Modal>

      {/* Chứng chỉ Modal */}
      {showCertificates && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: iconColor, color: "#fff", justifyContent: "center" }}>
                <h5 className="modal-title">Chứng chỉ</h5>
                <button type="button" className="btn-close" style={{ filter: "invert(1)" }} onClick={() => setShowCertificates(false)} aria-label="Close" />
              </div>
              <div className="modal-body text-center">
                {certificatesLoading && <p>Đang tải chứng chỉ...</p>}
                {certificatesError && <p className="text-danger">{certificatesError}</p>}
                {!certificatesLoading && certificates.length === 0 && <p>Không tìm thấy chứng chỉ nào.</p>}
                <ul className="list-group mx-auto" style={{ maxWidth: 400 }}>
                  {certificates.map((cert) => (
                    <li key={cert.id} className="list-group-item">
                      <strong>Người cấp phát:</strong> {cert.issuer}<br />
                      <strong>Ngày cấp phát:</strong> {cert.issuedDate}<br />
                      <strong>Ngày hết hạn:</strong> {cert.expirationDate}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn" style={{ background: iconColor, color: "#fff", minWidth: 100 }} onClick={() => setShowCertificates(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thông báo Toast */}
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
