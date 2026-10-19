import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function AdminLogin() {
  const navigate = useNavigate();
  const { setIsAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://raktsetu-backend-up1l.onrender.com/api/auth/admin/login', { email, password });
      setIsAdmin(true);
      navigate('/admin/dashboard');
    } catch (error) {
      setMsg(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🛡️ Admin Login</h2>
        <p className="sub">admin@raktsetu.com / admin123</p>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="auth-btn" type="submit">Login</button>
        </form>
        {msg && <p className="auth-msg error">{msg}</p>}
      </div>
    </div>
  );
}
export default AdminLogin;