import React, { useState } from 'react';
import './LoginForm.css';
import { FaRegUser } from "react-icons/fa";
import { RxLockClosed } from "react-icons/rx";
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await fetch(`http://localhost:5002/User?username=${username}&password=${password}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const users = await res.json();

      if (users.length > 0) {
localStorage.setItem("user", JSON.stringify( users[0])); // Store user data in localStorage
        console.log('Login successful:', users[0]);
        
        navigate('/');
      } else {
        setErrorMsg('Invalid username or password');
      }
    } catch (error) {
      setErrorMsg('Something went wrong. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>

        <div className="input-box">
          <FaRegUser />
          <input
            type="text"
            id="Username"
            name="Username"
            placeholder="Username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-box">
          <RxLockClosed />
          <input
            type="password"
            id="Password"
            name="Password"
            placeholder="Password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {errorMsg && <p className="error-message">{errorMsg}</p>}

        <button className={username && password ? "active" : "p"} type="submit">Login</button>

        <div className="register-link">
          <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
