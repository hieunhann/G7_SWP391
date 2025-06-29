import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
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
        const res = await fetch(
          `http://localhost:5002/Certificates?consultantId=${user.id}`
        );
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
    const updatedUser = {
      ...user,
      ...formData,
    };
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
    if (!user?.password) {
      setPasswordError("Tài khoản Gmail không hỗ trợ đổi mật khẩu.");
      return;
    }
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

  if (!user)
    return <p className="text-center my-5">Đang tải thông tin người dùng...</p>;

  const isConsultant = user.role?.toLowerCase() === "consultant";

  return (
    <>
      <Header />
      <div className="container my-5">
        <div className="card shadow mx-auto" style={{ maxWidth: "600px" }}>
          <div className="card-body">
            <h2
              className="card-title mb-4 text-center"
              style={{ color: iconColor }}
            >
              Thông tin cá nhân
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
                  margin: "0 auto",
                }}
              >
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              {[
                { id: "firstName", label: "Họ", type: "text" },
                { id: "lastName", label: "Tên", type: "text" },
                {
                  id: "username",
                  label: "Tên đăng nhập",
                  type: "text",
                  readOnly: true,
                },
                { id: "email", label: "Email", type: "email" },
                { id: "phoneNumber", label: "Số điện thoại", type: "tel" },
                { id: "dateOfBirth", label: "Ngày sinh", type: "date" },
              ].map(({ id, label, type, readOnly }) => (
                <div className="mb-3" key={id}>
                  <label
                    htmlFor={id}
                    className="form-label d-flex align-items-center justify-content-center gap-2"
                    style={{
                      color: iconColor,
                      fontSize: "1.2rem",
                      fontWeight: 500,
                    }}
                  >
                    <i
                      className={`bi bi-${
                        id === "email"
                          ? "envelope"
                          : id === "phoneNumber"
                          ? "telephone"
                          : id === "dateOfBirth"
                          ? "calendar2-week"
                          : id === "username"
                          ? "person"
                          : "pencil-square"
                      }`}
                      style={{ fontSize: "1.4rem" }}
                    ></i>
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
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleSave}
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setEditing(false);
                        setFormData(user);
                      }}
                    >
                      Hủy
                    </button>
                    {user?.password && (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={openPasswordModal}
                      >
                        Đổi mật khẩu
                      </button>
                    )}
                    {isConsultant && (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => setShowCertificates(true)}
                      >
                        Chứng chỉ
                      </button>
                    )}
                  </>
                ) : (
                  <>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setEditing(true)}
                  >
                    Chỉnh sửa hồ sơ
                  </button>
                    {user?.password && (
                <button
                  type="button"
                  className="btn btn-outline-primary"
                        onClick={openPasswordModal}
                >
                  Đổi mật khẩu
                </button>
                    )}
                {isConsultant && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowCertificates(true)}
                  >
                    Chứng chỉ
                  </button>
                )}
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
