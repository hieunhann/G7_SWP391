import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }

    try {
      // Kiểm tra xem username hoặc email đã tồn tại chưa
      const [usernameRes, emailRes] = await Promise.all([
        fetch(`http://localhost:5002/User?username=${formData.username}`),
        fetch(`http://localhost:5002/User?email=${formData.email}`)
      ]);

      const usernameData = await usernameRes.json();
      const emailData = await emailRes.json();

      if (usernameData.length > 0 || emailData.length > 0) {
        let message = "Đăng ký thất bại:\n";
        if (usernameData.length > 0) message += "- Tên người dùng đã tồn tại\n";
        if (emailData.length > 0) message += "- Email đã tồn tại";
        alert(message);
        return;
      }

      // Tạo người dùng mới với định dạng chuẩn
      const newUser = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        username: formData.username,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        role: "Member",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch("http://localhost:5002/User", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Đăng ký thất bại: ${errorData.message || response.statusText}`);
        return;
      }

      alert("Đăng ký thành công!");
      navigate("/login");

    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      alert("Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '100%', borderRadius: '8px' }}>
        <h2 className="text-center text-primary fw-bold mb-4">Đăng ký</h2>

        <form onSubmit={handleSubmit}>
          {/* Họ và tên */}
          <div className="mb-3">
            <label className="form-label">Họ và tên</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-person-lines-fill text-primary"></i>
              </span>
              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="Nhập họ và tên"
                onChange={handleChange}
                value={formData.fullName}
                required
              />
            </div>
          </div>

          {/* Tên đăng nhập */}
          <div className="mb-3">
            <label className="form-label">Tên đăng nhập</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-person text-primary"></i>
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
                <i className="bi bi-calendar2-week text-primary"></i>
              </span>
              <input
                type="date"
                name="dateOfBirth"
                className="form-control"
                onChange={handleChange}
                value={formData.dateOfBirth}
                required
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
                <i className="bi bi-phone text-primary"></i>
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
            style={{ backgroundColor: '#4a90e2', padding: '12px', fontSize: '16px', borderRadius: '4px' }}
          >
            Đăng ký
          </button>

          <div className="text-center mt-3">
            <p className="mb-0">
              Đã có tài khoản?{' '}
              <a href="/login" className="fw-semibold text-decoration-none" style={{ color: '#4a90e2' }}>
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
