import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import api from "../../Axios/Axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { Login } from "../../redux/features/userSlice"; // đảm bảo đã export đúng

const iconColor = "#004b8d";
const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [showCertificates, setShowCertificates] = useState(false);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [certificatesError, setCertificatesError] = useState("");

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{9,15}$/.test(phone);

  const dispatch = useDispatch(); // thêm dòng này ở đầu component

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

    try {
      const updatedUser = {
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        updatedAt: new Date().toISOString(),
        updatedBy: user.username,
      };

      const response = await api.patch(`/users/${user.id}`, updatedUser);
      const newUser = {
        ...response.data.data,
        accessToken: user.accessToken, // giữ token cũ
      };

      localStorage.setItem("user", JSON.stringify(newUser));
      dispatch(Login({ user: newUser, accessToken: newUser.accessToken }));
      setUser(newUser);
      setFormData(newUser);
      setEditing(false);
      toast.success("Thông tin đã được cập nhật.");
    } catch (error) {
      const message = error?.response?.data?.message || "Cập nhật thất bại.";
      console.error("Update user failed:", message);
      toast.error(message);
    }
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
                  color: iconColor,
                  fontSize: 48,
                  fontWeight: "bold",
                  userSelect: "none",
                  margin: "0 auto",
                }}
              >
                {user.firstName?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              {[
                { id: "firstName", label: "Họ", type: "text" },
                { id: "lastName", label: "Tên", type: "text" },
                { id: "email", label: "Email", type: "email" },
                { id: "phoneNumber", label: "Số điện thoại", type: "tel" },
                { id: "dateOfBirth", label: "Ngày sinh", type: "date" },
              ].map(({ id, label, type }) => (
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
                  onClick={() => toast.info("Chức năng đang phát triển")}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
