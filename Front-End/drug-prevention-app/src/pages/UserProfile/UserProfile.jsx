import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import api from "../../Axios/Axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { Login } from "../../redux/features/userSlice";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const iconColor = "#004b8d";
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [showCertificates, setShowCertificates] = useState(false);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [certificatesError, setCertificatesError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData(parsedUser);
      setAvatarPreview(
        parsedUser.avatar
          ? `http://localhost:8080/storage/avatars/${parsedUser.avatar}`
          : ""
      );
    }
  }, []);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (
        !user?.id ||
        !showCertificates ||
        user.role?.toLowerCase() !== "consultant"
      )
        return;
      setCertificatesLoading(true);
      setCertificatesError("");
      try {
        const res = await api.get(`/certificate/findByConsultantId/${user.id}`);
        setCertificates(res.data.data || []);
      } catch (error) {
        setCertificatesError(
          error?.response?.data?.message || "Lỗi khi tải chứng chỉ."
        );
      } finally {
        setCertificatesLoading(false);
      }
    };

    fetchCertificates();
  }, [user, showCertificates]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    // Sanitize file name: thay space = "_"
    const sanitizedFile = new File(
      [selectedFile],
      selectedFile.name.replace(/\s+/g, "_"),
      { type: selectedFile.type }
    );

    formData.append("file", sanitizedFile);
    formData.append("folder", "avatars");

    try {
      const res = await api.post("/files", formData);
      const fileName = res?.data?.data?.fileName;

      if (!fileName) {
        toast.error("Không nhận được tên file sau khi upload.");
        return null;
      }

      return fileName;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Tải ảnh đại diện thất bại."
      );
      console.error("Upload error:", error.response?.data || error.message);
      return null;
    }
  };

  const handleSave = async () => {
    const { firstName, lastName, email, phoneNumber, dateOfBirth } = formData;

    if (!firstName || !lastName || !email || !phoneNumber || !dateOfBirth) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Email không hợp lệ.");
      return;
    }

    if (!validatePhone(phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ.");
      return;
    }

    let avatarFileName = user.avatar;
    if (selectedFile) {
      avatarFileName = await handleUploadAvatar();
      if (!avatarFileName) return;
    }

    try {
      const updatedUser = {
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        avatar: avatarFileName,
        updatedAt: new Date().toISOString(),
        updatedBy: user.username,
      };

      const response = await api.patch(`/users/${user.id}`, updatedUser);
      const newUser = { ...user, ...response.data.data };
      localStorage.setItem("user", JSON.stringify(newUser));
      dispatch(Login({ user: newUser, accessToken: newUser.accessToken }));
      setUser(newUser);
      setFormData(newUser);
      setAvatarPreview(
        newUser.avatar
          ? `http://localhost:8080/storage/avatars/${newUser.avatar}`
          : ""
      );
      setSelectedFile(null);
      setEditing(false);
      toast.success("Thông tin đã được cập nhật.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cập nhật thất bại.");
    }
  };

  const handleChangePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      const res = await api.post(`/users/${user.id}/change-password`, {
        oldPassword,
        newPassword,
      });

      toast.success(res.data.message || "Đổi mật khẩu thành công.");
      setShowPasswordModal(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đổi mật khẩu thất bại.");
    }
  };

  if (!user) {
    return <p className="text-center my-5">Đang tải thông tin người dùng...</p>;
  }

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

            <div
              className="text-center mb-4 position-relative"
              style={{ width: 120, margin: "0 auto" }}
            >
              <img
                src={avatarPreview}
                alt=""
                className="rounded-circle border"
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
              {editing && (
                <>
                  <label
                    htmlFor="avatar-upload"
                    className="position-absolute"
                    style={{
                      bottom: 0,
                      right: 0,
                      transform: "translate(20%, 20%)",
                      background: "#004b8d",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "2px solid #fff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    }}
                    title="Đổi ảnh đại diện"
                  >
                    <i className="bi bi-camera-fill fs-5"></i>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (file.size > MAX_FILE_SIZE) {
                        toast.error(
                          "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB."
                        );
                        return;
                      }
                      setSelectedFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }}
                    style={{ display: "none" }}
                  />
                </>
              )}
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              {[
                "firstName",
                "lastName",
                "email",
                "phoneNumber",
                "dateOfBirth",
              ].map((id) => (
                <div className="mb-3" key={id}>
                  <label className="form-label" style={{ color: iconColor }}>
                    {
                      {
                        firstName: "Họ",
                        lastName: "Tên",
                        email: "Email",
                        phoneNumber: "Số điện thoại",
                        dateOfBirth: "Ngày sinh",
                      }[id]
                    }
                  </label>
                  <input
                    type={
                      id === "dateOfBirth"
                        ? "date"
                        : id === "email"
                        ? "email"
                        : id === "phoneNumber"
                        ? "tel"
                        : "text"
                    }
                    name={id}
                    className="form-control text-center"
                    value={formData[id] || ""}
                    onChange={handleChange}
                    disabled={!editing}
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
                        setAvatarPreview(
                          user.avatar
                            ? `http://localhost:8080/storage/avatars/${user.avatar}`
                            : ""
                        );
                        setSelectedFile(null);
                      }}
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setEditing(true)}
                  >
                    Chỉnh sửa hồ sơ
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Đổi mật khẩu
                </button>
                {isConsultant && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowCertificates(true)}
                  >
                    Chứng chỉ
                  </button>
                )}
              </div>
            </form>

            {/* Certificate Modal */}
            <Modal
              show={showCertificates}
              onHide={() => setShowCertificates(false)}
              centered
              size="lg"
            >
              <Modal.Header closeButton>
                <Modal.Title>Danh sách chứng chỉ</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {certificatesLoading ? (
                  <p>Đang tải chứng chỉ...</p>
                ) : certificatesError ? (
                  <p className="text-danger">{certificatesError}</p>
                ) : certificates.length === 0 ? (
                  <p>Không có chứng chỉ nào.</p>
                ) : (
                  <div className="list-group">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="list-group-item mb-3 shadow-sm rounded"
                      >
                        <h5 className="text-primary">{cert.name}</h5>
                        <p>
                          <strong>Người cấp:</strong> {cert.issuer}
                        </p>
                        <p>
                          <strong>Ngày cấp:</strong>{" "}
                          {new Date(cert.issueDate).toLocaleDateString("vi-VN")}
                        </p>
                        <p>
                          <strong>Ngày hết hạn:</strong>{" "}
                          {new Date(cert.expiryDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowCertificates(false)}
                >
                  Đóng
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Password Modal */}
            <Modal
              show={showPasswordModal}
              onHide={() => setShowPasswordModal(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Đổi mật khẩu</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  {Object.entries(passwordData).map(([key, val]) => (
                    <Form.Group key={key} className="mb-3">
                      <Form.Label>
                        {key === "oldPassword"
                          ? "Mật khẩu cũ"
                          : key === "newPassword"
                          ? "Mật khẩu mới"
                          : "Xác nhận mật khẩu mới"}
                      </Form.Label>
                      <Form.Control
                        type="password"
                        value={val}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                      />
                    </Form.Group>
                  ))}
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Hủy
                </Button>
                <Button variant="primary" onClick={handleChangePassword}>
                  Xác nhận
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
