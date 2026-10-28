import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DonorTrackMap from './DonorTrackMap';
import './Auth.css';

const STEPS = ['Accepted', 'On the way', 'Reached hospital', 'Donated'];

function RecipientDashboard() {
  const { recipient } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '', bloodGroup: '', unitsRequired: '', urgency: '',
    hospitalName: '', hospitalAddress: '', city: '', contactPerson: '', contactPhone: ''
  });
  const [msg, setMsg] = useState('');
  const [openId, setOpenId] = useState(null);
  const [acceptedDonors, setAcceptedDonors] = useState({});

  const loadMyRequests = useCallback(async () => {
    if (!recipient) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/requests/by-recipient/${recipient._id}`);
      setMyRequests(res.data);
    } catch (error) { console.error(error); }
  }, [recipient]);

  useEffect(() => {
    if (recipient) {
      setFormData((f) => ({
        ...f, hospitalName: recipient.hospitalName || '', city: recipient.city,
        contactPerson: recipient.name, contactPhone: recipient.phone
      }));
      loadMyRequests();
    }
  }, [recipient, loadMyRequests]);

  // Auto-refresh the open donor list every 10 seconds
  useEffect(() => {
    if (!openId) return;
    const timer = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/requests/${openId}/accepted-donors`);
        setAcceptedDonors((prev) => ({ ...prev, [openId]: res.data.donors }));
      } catch (e) { console.error(e); }
    }, 10000);
    return () => clearInterval(timer);
  }, [openId]);

  if (!recipient) return <Navigate to="/recipient/login" />;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/requests/create', { ...formData, recipientId: recipient._id });
      setMsg('Request submitted successfully!');
      setShowForm(false);
      loadMyRequests();
    } catch (error) {
      setMsg(error.response?.data?.message || 'Error submitting request');
    }
  };

  const toggleDonors = async (requestId) => {
    if (openId === requestId) { setOpenId(null); return; }
    try {
      const res = await axios.get(`http://localhost:5000/api/requests/${requestId}/accepted-donors`);
      setAcceptedDonors({ ...acceptedDonors, [requestId]: res.data.donors });
      setOpenId(requestId);
    } catch (error) {
      setMsg(error.response?.data?.message || 'Error loading donors');
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
          <label>Hospital Address</label>
          <input name="hospitalAddress" value={formData.hospitalAddress} onChange={handleChange} placeholder="Street, area, landmark" required />
          <label>City</label>
          <input name="city" value={formData.city} onChange={handleChange} required />
          <button className="auth-btn" type="submit">Submit Request</button>
        </form>
      )}
      {msg && <p className="auth-msg success">{msg}</p>}

      <h3 className="section-title">My Requests ({myRequests.length})</h3>
      <table className="dash-table">
        <thead>
          <tr><th>Patient</th><th>Blood Group</th><th>Hospital</th><th>Urgency</th><th>Status</th><th>Donors</th></tr>
        </thead>
        <tbody>
          {myRequests.map((r) => (
            <React.Fragment key={r._id}>
              <tr>
                <td>{r.patientName}</td><td>{r.bloodGroup}</td><td>{r.hospitalName}</td><td>{r.urgency}</td>
                <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
                <td>
                  <button className="accept-btn" onClick={() => toggleDonors(r._id)}>
                    {openId === r._id ? 'Hide' : 'View Donors'}
                  </button>
                </td>
              </tr>
              {openId === r._id && (
                <tr>
                  <td colSpan="6">
                    {(acceptedDonors[r._id] || []).length === 0 && (
                      <p style={{ color: '#888', margin: 8 }}>No donor has accepted yet.</p>
                    )}
                    {(acceptedDonors[r._id] || []).map((d) => {
                      const idx = STEPS.indexOf(d.progress);
                      return (
                        <div className="match-card" key={d._id} style={{ display: 'block' }}>
                          <div style={{ lineHeight: 1.6 }}>
                            <div><strong>{d.name}</strong> — {d.bloodGroup}</div>
                            <div>📍 Coming from: <b>{d.city}</b></div>
                            <div>🚗 Distance: <b>{d.distanceKm !== null ? `${d.distanceKm} km` : 'Unknown'}</b> from the hospital</div>
                            <div>📞 {d.phone}</div>
                          </div>

                          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                            {STEPS.map((s, i) => (
                              <span key={s} style={{
                                padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                                background: i <= idx ? '#2e7d32' : '#e0e0e0',
                                color: i <= idx ? '#fff' : '#777'
                              }}>{i <= idx ? '✔ ' : ''}{s}</span>
                            ))}
                          </div>

                          {d.progressUpdatedAt && (
                            <div className="match-meta">Updated: {new Date(d.progressUpdatedAt).toLocaleTimeString()}</div>
                          )}

                          {/* 👇 LIVE TRACKING MAP goes here */}
                          {(d.progress === 'On the way' || d.progress === 'Reached hospital') && (
                            <DonorTrackMap
                              hospital={{
                                name: r.hospitalName,
                                address: r.hospitalAddress,
                                city: r.city,
                                lat: r.latitude,
                                lng: r.longitude
                              }}
                              donor={d.lat != null ? { lat: d.lat, lng: d.lng } : null}
                            />
                          )}
                        </div>
                      );
                    })}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default RecipientDashboard;