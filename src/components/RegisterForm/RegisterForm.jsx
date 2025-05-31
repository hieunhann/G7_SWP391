import React, { useState } from 'react';
import './RegisterForm.css';
import { FaRegUser } from "react-icons/fa";
import { RxLockClosed } from "react-icons/rx";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { CiMail } from "react-icons/ci";
import { LiaBirthdayCakeSolid } from "react-icons/lia";
import { useNavigate } from 'react-router-dom';
import { IoIosPhonePortrait } from "react-icons/io";

const RegisterForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    date_of_birth: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    const newUser = {
      fullname: formData.fullname,
      email: formData.email,
      phone_number: formData.phone_number,
      username: formData.username,
      password: formData.password,
      date_of_birth: formData.date_of_birth,
      role: "Member",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avatar: "/avatars/default.jpg"
    };

    try {
      const response = await fetch("http://localhost:5002/User", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`❌ Registration failed: ${errorData.message || response.statusText}`);
        return;
      }

      alert("✅ Registration successful!");
      navigate("/login");

    } catch (error) {
      console.error("Registration error:", error);
      alert("❌ Error occurred during registration. Please try again.");
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit}>
        <h1>Register</h1>

        <div className="input-box">
          <MdDriveFileRenameOutline />
          <input type="text" name="fullname" placeholder="Fullname" required onChange={handleChange} />
        </div>

        <div className="input-box">
          <FaRegUser />
          <input type="text" name="username" placeholder="Username" required onChange={handleChange} />
        </div>

    <div className="input-box">
  <LiaBirthdayCakeSolid />
  <input
    type="date"
    name="date_of_birth"
    placeholder="Birthday"
    required
    onChange={handleChange}
  />
</div>




        <div className="input-box">
          <CiMail />
          <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        </div>

        <div className="input-box">
          <IoIosPhonePortrait />
          <input type="text" name="phone_number" placeholder="Phone number" required onChange={handleChange} />
        </div>

        <div className="input-box">
          <RxLockClosed />
          <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
        </div>

        <div className="input-box">
          <RxLockClosed />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" required onChange={handleChange} />
        </div>

        <button type="submit">Register</button>

        <div className="Login-link">
          <p>Have an account? <a href="/login">Login here</a></p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
