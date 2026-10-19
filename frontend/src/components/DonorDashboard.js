import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function DonorDashboard() {
  const { donor } = useAuth();
  const [matches, setMatches] = useState([]);
  const [msg, setMsg] = useState('');

  const loadMatches = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/donors/${donor._id}/matches`);
      setMatches(res.data.matches);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { if (donor) loadMatches(); }, [donor]);

  if (!donor) return <Navigate to="/donor/login" />;

  const respond = async (requestId, response) => {
    try {
      await axios.post(`http://localhost:5000/api/requests/${requestId}/respond`, { donorId: donor._id, response });
      setMsg(`Response recorded: ${response}`);
      loadMatches();
    } catch (error) {
      setMsg(error.response?.data?.message || 'Error responding');
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-header"><h2>Welcome, {donor.name}</h2></div>
      <p className="dash-subinfo">
        Blood Group: <b>{donor.bloodGroup}</b> &nbsp;•&nbsp; City: <b>{donor.city}</b> &nbsp;•&nbsp;
        Status: <b>{donor.isAvailable ? 'Available' : 'Unavailable (cooldown)'}</b>
      </p>

      {msg && <p className="auth-msg success">{msg}</p>}

      <h3 className="section-title">Matched Emergency Requests ({matches.length})</h3>
      {matches.length === 0 && <p style={{ color: '#888' }}>No matching requests right now.</p>}
      {matches.map((m) => (
        <div className="match-card" key={m._id}>
          <div>
            <strong>{m.patientName}</strong> needs {m.bloodGroup} at {m.hospitalName}
            <div className="match-meta">{m.city} • {m.distanceKm} km away • {m.urgency}</div>
          </div>
          <div>
            <button className="accept-btn" onClick={() => respond(m._id, 'Accepted')}>Accept</button>
            <button className="decline-btn" onClick={() => respond(m._id, 'Declined')}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
}
export default DonorDashboard;