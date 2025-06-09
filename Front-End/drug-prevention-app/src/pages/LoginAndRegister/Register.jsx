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
      alert("Passwords do not match!");
      return;
    }

    try {
      // Kiểm tra username hoặc email đã tồn tại chưa
      const [usernameRes, emailRes] = await Promise.all([
        fetch(`http://localhost:5002/User?username=${formData.username}`),
        fetch(`http://localhost:5002/User?email=${formData.email}`)
      ]);

      const usernameData = await usernameRes.json();
      const emailData = await emailRes.json();

      if (usernameData.length > 0 || emailData.length > 0) {
        let message = "Registration failed:\n";
        if (usernameData.length > 0) message += "- Username already exists\n";
        if (emailData.length > 0) message += "- Email already exists";
        alert(message);
        return;
      }

      // Tạo user mới theo đúng định dạng
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
        avatar: "/avatars/default.jpg"
      };

      const response = await fetch("http://localhost:5002/User", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.message || response.statusText}`);
        return;
      }

      alert("Registration successful!");
      navigate("/login");

    } catch (error) {
      console.error("Registration error:", error);
      alert("Error occurred during registration. Please try again.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '100%', borderRadius: '8px' }}>
        <h2 className="text-center text-primary fw-bold mb-4">Register</h2>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-person-lines-fill text-primary"></i>
              </span>
              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="Enter full name"
                onChange={handleChange}
                value={formData.fullName}
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="mb-3">
            <label className="form-label">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-person text-primary"></i>
              </span>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Enter username"
                onChange={handleChange}
                value={formData.username}
                required
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="mb-3">
            <label className="form-label">Date of Birth</label>
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
                placeholder="Enter email"
                onChange={handleChange}
                value={formData.email}
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-phone text-primary"></i>
              </span>
              <input
                type="text"
                name="phoneNumber"
                className="form-control"
                placeholder="Enter phone number"
                onChange={handleChange}
                value={formData.phoneNumber}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-lock text-primary"></i>
              </span>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter password"
                onChange={handleChange}
                value={formData.password}
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-lock-fill text-primary"></i>
              </span>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Confirm password"
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
            Register
          </button>

          <div className="text-center mt-3">
            <p className="mb-0">
              Have an account?{' '}
              <a href="/login" className="fw-semibold text-decoration-none" style={{ color: '#4a90e2' }}>
                Login here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
