import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function RecipientDashboard() {
  const { recipient } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '', bloodGroup: '', unitsRequired: '', urgency: '',
    hospitalName: '', city: '', contactPerson: '', contactPhone: ''
  });
  const [msg, setMsg] = useState('');

  const loadMyRequests = async () => {
    try {
      const res = await axios.get(`https://raktsetu-backend-up1l.onrender.com/api/requests/by-recipient/${recipient._id}`);
      setMyRequests(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (recipient) {
      setFormData((f) => ({
        ...f, hospitalName: recipient.hospitalName || '', city: recipient.city,
        contactPerson: recipient.name, contactPhone: recipient.phone
      }));
      loadMyRequests();
    }
  }, [recipient]);

  if (!recipient) return <Navigate to="/recipient/login" />;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://raktsetu-backend-up1l.onrender.com/api/requests/create', { ...formData, recipientId: recipient._id });
      setMsg('Request submitted successfully!');
      setShowForm(false);
      loadMyRequests();
    } catch (error) {
      setMsg(error.response?.data?.message || 'Error submitting request');
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-header"><h2>Welcome, {recipient.name}</h2></div>
      <p className="dash-subinfo">{recipient.hospitalName || 'Individual Recipient'} &nbsp;•&nbsp; {recipient.city}</p>

      <button className="toggle-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ New Emergency Request'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="new-request-form">
          <div className="form-row2">
            <div>
              <label>Patient Name</label>
              <input name="patientName" value={formData.patientName} onChange={handleChange} required />
            </div>
            <div>
              <label>Blood Group Needed</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row2">
            <div>
              <label>Units Required</label>
              <input type="number" name="unitsRequired" value={formData.unitsRequired} onChange={handleChange} min="1" required />
            </div>
            <div>
              <label>Urgency</label>
              <select name="urgency" value={formData.urgency} onChange={handleChange} required>
                <option value="">Select</option><option>Critical</option><option>High</option><option>Normal</option>
              </select>
            </div>
          </div>
          <label>Hospital Name</label>
          <input name="hospitalName" value={formData.hospitalName} onChange={handleChange} required />
          <label>City</label>
          <input name="city" value={formData.city} onChange={handleChange} required />
          <button className="auth-btn" type="submit">Submit Request</button>
        </form>
      )}
      {msg && <p className="auth-msg success">{msg}</p>}

      <h3 className="section-title">My Requests ({myRequests.length})</h3>
      <table className="dash-table">
        <thead><tr><th>Patient</th><th>Blood Group</th><th>Urgency</th><th>Status</th></tr></thead>
        <tbody>
          {myRequests.map((r) => (
            <tr key={r._id}>
              <td>{r.patientName}</td><td>{r.bloodGroup}</td><td>{r.urgency}</td>
              <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default RecipientDashboard;