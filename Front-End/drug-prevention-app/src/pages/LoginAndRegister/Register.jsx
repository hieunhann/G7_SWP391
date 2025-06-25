import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Axios/Axios";
import { toast } from "react-toastify";
const today = new Date().toISOString().split("T")[0];

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    try {
      const newUser = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        role: "MEMBER",
      };

      await api.post("users", newUser);

      toast.success("Đăng ký thành công!");
      setTimeout(() => navigate("/login"), 2000); 
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      const message =
        error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
      toast.error(`Đăng ký thất bại: ${message}`);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}
    >
      <div
        className="card p-4 shadow"
        style={{ maxWidth: "500px", width: "100%", borderRadius: "8px" }}
      >
        <h2 className="text-center text-primary fw-bold mb-4">Đăng ký</h2>

        <form onSubmit={handleSubmit}>
          {/* Họ */}
          <div className="mb-3">
            <label className="form-label">Họ</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-person text-primary"></i>
              </span>
              <input
                type="text"
                name="firstName"
                className="form-control"
                placeholder="Nhập họ"
                onChange={handleChange}
                value={formData.firstName}
                required
              />
            </div>
          </div>

          {/* Tên */}
          <div className="mb-3">
            <label className="form-label">Tên</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-person text-primary"></i>
              </span>
              <input
                type="text"
                name="lastName"
                className="form-control"
                placeholder="Nhập tên"
                onChange={handleChange}
                value={formData.lastName}
                required
              />
            </div>
          </div>

          {/* Tên đăng nhập */}
          <div className="mb-3">
            <label className="form-label">Tên đăng nhập</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-person-circle text-primary"></i>
              </span>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Nhập tên đăng nhập"
                onChange={handleChange}
                value={formData.username}
                required
              />
            </div>
          </div>

          {/* Ngày sinh */}
          <div className="mb-3">
            <label className="form-label">Ngày sinh</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-calendar-date text-primary"></i>
              </span>
              <input
                type="date"
                name="dateOfBirth"
                className="form-control"
                onChange={handleChange}
                value={formData.dateOfBirth}
                required
                max={today}
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-envelope text-primary"></i>
              </span>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Nhập email"
                onChange={handleChange}
                value={formData.email}
                required
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div className="mb-3">
            <label className="form-label">Số điện thoại</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-telephone text-primary"></i>
              </span>
              <input
                type="text"
                name="phoneNumber"
                className="form-control"
                placeholder="Nhập số điện thoại"
                onChange={handleChange}
                value={formData.phoneNumber}
                required
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-lock text-primary"></i>
              </span>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Nhập mật khẩu"
                onChange={handleChange}
                value={formData.password}
                required
              />
            </div>
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="mb-4">
            <label className="form-label">Xác nhận mật khẩu</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-lock-fill text-primary"></i>
              </span>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Nhập lại mật khẩu"
                onChange={handleChange}
                value={formData.confirmPassword}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn text-white w-100"
            style={{
              backgroundColor: "#4a90e2",
              padding: "12px",
              fontSize: "16px",
              borderRadius: "4px",
            }}
          >
            Đăng ký
          </button>

          <div className="text-center mt-3">
            <p className="mb-0">
              Đã có tài khoản?{" "}
              <a
                href="/login"
                className="fw-semibold text-decoration-none"
                style={{ color: "#4a90e2" }}
              >
                Đăng nhập tại đây
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;