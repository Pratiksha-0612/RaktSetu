import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function RecipientLogin() {
  const navigate = useNavigate();
  const { setRecipient } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://raktsetu-backend-up1l.onrender.com/api/auth/recipient/login', { email, password });
      setRecipient(res.data.recipient);
      navigate('/recipient/dashboard');
    } catch (error) {
      setMsg(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🏥 Recipient Login</h2>
        <p className="sub">Log in to manage your emergency requests</p>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="auth-btn" type="submit">Login</button>
        </form>
        {msg && <p className="auth-msg error">{msg}</p>}
        <p className="auth-switch">New here? <Link to="/recipient/signup">Sign up</Link></p>
      </div>
    </div>
  );
}
export default RecipientLogin;