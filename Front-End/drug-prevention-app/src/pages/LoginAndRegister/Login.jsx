import React, { useState } from 'react';
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
      const res = await fetch(`http://localhost:5002/User`);
      if (!res.ok) throw new Error('Failed to fetch user list');

      const users = await res.json();

      const foundUser = users.find(
        (u) => u.username === username && u.password === password
      );

      if (foundUser) {
        localStorage.setItem('user', JSON.stringify(foundUser));
        navigate('/');
      } else {
        setErrorMsg('Invalid username or password');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <>
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}>
        <h2 className="text-center text-primary fw-bold mb-4">Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 position-relative">
            <label htmlFor="username" className="form-label">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-person text-primary"></i>
              </span>
              <input
                type="text"
                id="username"
                className="form-control border-start-0"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-lock text-primary"></i>
              </span>
              <input
                type="password"
                id="password"
                className="form-control border-start-0"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {errorMsg && <div className="alert alert-danger text-center py-2">{errorMsg}</div>}

          <button
            type="submit"
            className="btn w-100 text-white"
            style={{
              backgroundColor: '#004b8d',
              border: 'none',
              padding: '12px',
              fontSize: '16px',
              borderRadius: '4px'
            }}
          >
            Login
          </button>

          <div className="text-center mt-3">
            <p className="mb-0">
              Don't have an account?{' '}
              <a href="/register" className="fw-semibold text-decoration-none" style={{ color: '#004b8d' }}>
                Register here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default LoginForm;
