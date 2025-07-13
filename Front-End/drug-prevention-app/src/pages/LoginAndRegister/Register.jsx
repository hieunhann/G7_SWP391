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
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim())
      newErrors.firstName = "Họ không được để trống";
    if (!formData.lastName.trim())
      newErrors.lastName = "Tên không được để trống";
    if (!formData.username.trim())
      newErrors.username = "Tên đăng nhập không được để trống";

    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
    else if (new Date(formData.dateOfBirth) > new Date(today))
      newErrors.dateOfBirth = "Ngày sinh không hợp lệ";

    if (!emailRegex.test(formData.email))
      newErrors.email = "Email không hợp lệ";
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

  const renderInput = (label, name, type, placeholder) => (
    <div className="mb-4">
      <label className="block text-lg font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        max={name === "dateOfBirth" ? today : undefined}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-lg border ${
          errors[name] ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4">
      <div className="relative z-10 w-full max-w-2xl bg-white/40 backdrop-blur-xxs border border-white/30 shadow-2xl rounded-3xl p-10">
        <h2 className="text-3xl font-bold text-center text-[black] mb-8 drop-shadow">
          Đăng ký tài khoản
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {renderInput("Họ", "firstName", "text", "Nhập họ")}
          {renderInput("Tên", "lastName", "text", "Nhập tên")}
        </form>
        {renderInput("Tên đăng nhập", "username", "text", "Nhập tên đăng nhập")}
        {renderInput("Ngày sinh", "dateOfBirth", "date", "")}
        {renderInput("Email", "email", "email", "Nhập email")}
        {renderInput(
          "Số điện thoại",
          "phoneNumber",
          "text",
          "Nhập số điện thoại"
        )}
        {renderInput("Mật khẩu", "password", "password", "Nhập mật khẩu")}
        {renderInput(
          "Xác nhận mật khẩu",
          "confirmPassword",
          "password",
          "Nhập lại mật khẩu"
        )}
        <button
          type="submit"
          onClick={handleSubmit}
          className="btn btn-outline-primary w-100 mt-1"
        >
          Đăng ký
        </button>

        <p className="text-center text-lg mt-6">
          Đã có tài khoản?{" "}
          <a
            href="/login"
            className="text-blue-700 font-medium hover:underline"
          >
            Đăng nhập tại đây
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
