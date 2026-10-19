import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function DonorSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', weight: '', bloodGroup: '', phone: '', email: '', password: '', city: '',
    noChronicIllness: false, noRecentSurgery: false, noRecentDonation: false
  });
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.noChronicIllness || !formData.noRecentSurgery || !formData.noRecentDonation) {
      setIsError(true); setMsg('Please confirm all eligibility criteria.'); return;
    }
    try {
      const payload = {
        ...formData,
        eligibility: {
          noChronicIllness: formData.noChronicIllness,
          noRecentSurgery: formData.noRecentSurgery,
          noRecentDonation: formData.noRecentDonation
        }
      };
      await axios.post('https://raktsetu-backend-up1l.onrender.com/api/auth/donor/signup', payload);
      setIsError(false); setMsg('Account created! Redirecting to login...');
      setTimeout(() => navigate('/donor/login'), 1200);
    } catch (error) {
      setIsError(true);
      setMsg(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🩸 Donor Sign Up</h2>
        <p className="sub">Create your RaktSetu donor account</p>
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />

          <label>Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} min="18" max="65" required />

          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
          </select>

          <label>Weight (kg)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="45" required />

          <label>Blood Group</label>
          <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
            <option value="">Select</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
          </select>

          <label>City</label>
          <input name="city" value={formData.city} onChange={handleChange} required />

          <label>Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} required />

          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />

          <div className="eligibility-list">
            <label>
              <input type="checkbox" name="noChronicIllness" checked={formData.noChronicIllness} onChange={handleChange} />
              No chronic illness (HIV, Hepatitis, Cancer, etc.)
            </label>
            <label>
              <input type="checkbox" name="noRecentSurgery" checked={formData.noRecentSurgery} onChange={handleChange} />
              No major surgery in the last 6 months
            </label>
            <label>
              <input type="checkbox" name="noRecentDonation" checked={formData.noRecentDonation} onChange={handleChange} />
              No blood donation in the last 90 days
            </label>
          </div>

          <button className="auth-btn" type="submit">Create Account</button>
        </form>
        {msg && <p className={`auth-msg ${isError ? 'error' : 'success'}`}>{msg}</p>}
        <p className="auth-switch">Already have an account? <Link to="/donor/login">Login</Link></p>
      </div>
    </div>
  );
}
export default DonorSignup;