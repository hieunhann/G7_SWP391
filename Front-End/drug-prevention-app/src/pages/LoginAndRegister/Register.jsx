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

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" })); // clear error khi nhập lại
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) newErrors.firstName = "Họ không được để trống";
    if (!formData.lastName.trim()) newErrors.lastName = "Tên không được để trống";
    if (!formData.username.trim()) newErrors.username = "Tên đăng nhập không được để trống";

    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
    else if (new Date(formData.dateOfBirth) > new Date(today))
      newErrors.dateOfBirth = "Ngày sinh không hợp lệ";

    if (!emailRegex.test(formData.email)) newErrors.email = "Email không hợp lệ";

    if (!phoneRegex.test(formData.phoneNumber))
      newErrors.phoneNumber = "Số điện thoại phải có 10 chữ số";

    if (formData.password.length < 6)
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const newUser = {
        ...formData,
        role: "MEMBER",
      };

      await api.post("users", newUser);

      toast.success("Đăng ký thành công!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const message =
        error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
      toast.error(`Đăng ký thất bại: ${message}`);
    }
  };

  const renderInput = (label, name, type, icon, placeholder) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="input-group">
        <span className="input-group-text bg-white">
          <i className={`bi ${icon} text-primary`}></i>
        </span>
        <input
          type={type}
          name={name}
          className="form-control"
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          max={name === "dateOfBirth" ? today : undefined}
        />
      </div>
      {errors[name] && (
        <div className="text-danger small mt-1">{errors[name]}</div>
      )}
    </div>
  );

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
          {renderInput("Họ", "firstName", "text", "bi-person", "Nhập họ")}
          {renderInput("Tên", "lastName", "text", "bi-person", "Nhập tên")}
          {renderInput(
            "Tên đăng nhập",
            "username",
            "text",
            "bi-person-circle",
            "Nhập tên đăng nhập"
          )}
          {renderInput(
            "Ngày sinh",
            "dateOfBirth",
            "date",
            "bi-calendar-date",
            ""
          )}
          {renderInput(
            "Email",
            "email",
            "email",
            "bi-envelope",
            "Nhập email"
          )}
          {renderInput(
            "Số điện thoại",
            "phoneNumber",
            "text",
            "bi-telephone",
            "Nhập số điện thoại"
          )}
          {renderInput(
            "Mật khẩu",
            "password",
            "password",
            "bi-lock",
            "Nhập mật khẩu"
          )}
          {renderInput(
            "Xác nhận mật khẩu",
            "confirmPassword",
            "password",
            "bi-lock-fill",
            "Nhập lại mật khẩu"
          )}

          <button
            type="submit"
            className="btn btn-outline-primary w-100 mt-2"
            style={{ padding: "12px", fontSize: "16px", borderRadius: "4px" }}
          >
            Đăng ký
          </button>

          <div className="text-center mt-3">
            <p className="mb-0">
              Đã có tài khoản?{" "}
              <a
                href="/login"
                className="fw-semibold text-decoration-none"
                style={{ color: "#0d6efd" }}
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
