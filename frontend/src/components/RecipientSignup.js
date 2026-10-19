import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function RecipientSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', hospitalName: '', city: '' });
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/recipient/signup', formData);
      setIsError(false); setMsg('Account created! Redirecting to login...');
      setTimeout(() => navigate('/recipient/login'), 1200);
    } catch (error) {
      setIsError(true);
      setMsg(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🏥 Recipient / Hospital Sign Up</h2>
        <p className="sub">Create an account to submit emergency requests</p>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />
          <label>Hospital Name (optional)</label>
          <input name="hospitalName" value={formData.hospitalName} onChange={handleChange} />
          <label>City</label>
          <input name="city" value={formData.city} onChange={handleChange} required />
          <label>Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} required />
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          <button className="auth-btn" type="submit">Create Account</button>
        </form>
        {msg && <p className={`auth-msg ${isError ? 'error' : 'success'}`}>{msg}</p>}
        <p className="auth-switch">Already have an account? <Link to="/recipient/login">Login</Link></p>
      </div>
    </div>
  );
}
export default RecipientSignup;