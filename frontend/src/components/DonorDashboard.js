import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const STEPS = ['Accepted', 'On the way', 'Reached hospital', 'Donated'];
const NEXT_LABEL = {
  'On the way': "I'm on the way",
  'Reached hospital': 'I have reached the hospital',
  'Donated': 'I have donated'
};

function DonorDashboard() {
  const { donor } = useAuth();
  const [matches, setMatches] = useState([]);
  const [myAccepted, setMyAccepted] = useState([]);
  const [msg, setMsg] = useState('');

  const loadAll = useCallback(async () => {
    if (!donor) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/donors/${donor._id}/matches`);
      setMatches(res.data.matches);
    } catch (error) { console.error(error); }
    try {
      const res2 = await axios.get(`http://localhost:5000/api/requests/by-donor/${donor._id}`);
      setMyAccepted(res2.data);
    } catch (error) { console.error(error); }
  }, [donor]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ✅ PIECE 1: Share live location while the donor is "On the way"
  // (must stay ABOVE the "if (!donor) return" line below)
  const trackingIds = myAccepted.filter((m) => m.myProgress === 'On the way').map((m) => m._id).join(',');
  useEffect(() => {
    if (!trackingIds || !donor) return;
    if (!navigator.geolocation) {
      setMsg('Your browser does not support location sharing.');
      return;
    }
    const ids = trackingIds.split(',');
    let last = 0;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - last < 8000) return;
        last = now;
        ids.forEach((id) =>
          axios
            .patch(`http://localhost:5000/api/requests/${id}/donor-location`, {
              donorId: donor._id,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            })
            .catch((e) => console.error(e))
        );
      },
      () => setMsg('Please allow location access so the recipient can track you.'),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [trackingIds, donor]);

  if (!donor) return <Navigate to="/donor/login" />;

  const respond = async (requestId, response) => {
    try {
      await axios.post(`http://localhost:5000/api/requests/${requestId}/respond`, { donorId: donor._id, response });
      setMsg(`Response recorded: ${response}`);
      loadAll();
    } catch (error) {
      setMsg(error.response?.data?.message || 'Error responding');
    }
  };

  const updateProgress = async (requestId, progress) => {
    try {
      await axios.patch(`http://localhost:5000/api/requests/${requestId}/donor-progress`, { donorId: donor._id, progress });
      setMsg(`Status updated: ${progress}`);
      loadAll();
    } catch (error) {
      setMsg(error.response?.data?.message || 'Error updating status');
    }
  };

  const mapsLink = (m) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${m.hospitalName}, ${m.hospitalAddress || ''}, ${m.city}`
    )}`;

  return (
    <div className="dash-page">
      <div className="dash-header"><h2>Welcome, {donor.name}</h2></div>
      <p className="dash-subinfo">
        Blood Group: <b>{donor.bloodGroup}</b> &nbsp;•&nbsp; City: <b>{donor.city}</b> &nbsp;•&nbsp;
        Status: <b>{donor.isAvailable ? 'Available' : 'Unavailable (cooldown)'}</b>
      </p>

      {msg && <p className="auth-msg success">{msg}</p>}

      {myAccepted.length > 0 && (
        <>
          <h3 className="section-title">My Accepted Requests ({myAccepted.length})</h3>
          {myAccepted.map((m) => {
            const idx = STEPS.indexOf(m.myProgress);
            const next = STEPS[idx + 1];
            return (
              <div className="match-card" key={m._id}>
                <div style={{ lineHeight: 1.6 }}>
                  <div><strong>{m.patientName}</strong> needs <strong>{m.bloodGroup}</strong></div>
                  <div>🏥 {m.hospitalName} — {m.hospitalAddress || 'Address not provided'}, {m.city}</div>
                  <div>📞 {m.contactPerson} — {m.contactPhone}</div>
                  <div>Your status: <b style={{ color: '#2e7d32' }}>{m.myProgress}</b></div>

                  {/* ✅ PIECE 2: live location notice */}
                  {m.myProgress === 'On the way' && (
                    <div style={{ color: '#c0392b', fontSize: 13 }}>📡 Sharing your live location (keep this page open)</div>
                  )}

                  <a href={mapsLink(m)} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>Get Directions ↗</a>
                </div>
                <div>
                  {next ? (
                    <button className="accept-btn" onClick={() => updateProgress(m._id, next)}>{NEXT_LABEL[next]}</button>
                  ) : (
                    <b style={{ color: '#2e7d32' }}>✔ Thank you for donating!</b>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      <h3 className="section-title">Matched Emergency Requests ({matches.length})</h3>
      {matches.length === 0 && <p style={{ color: '#888' }}>No matching requests right now.</p>}
      {matches.map((m) => (
        <div className="match-card" key={m._id}>
          <div style={{ lineHeight: 1.6 }}>
            <div><strong>{m.patientName}</strong> needs <strong>{m.bloodGroup}</strong> ({m.unitsRequired} unit(s)) — <b>{m.urgency}</b></div>
            <div>🏥 <b>Hospital:</b> {m.hospitalName}</div>
            <div>📍 <b>Address:</b> {m.hospitalAddress || 'Not provided'}, {m.city}</div>
            <div>📞 <b>Contact:</b> {m.contactPerson} — {m.contactPhone}</div>
            <div className="match-meta">🚗 {m.distanceKm} km from your location</div>
            <a href={mapsLink(m)} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>Get Directions ↗</a>
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