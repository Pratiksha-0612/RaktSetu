import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/stats').then(res => setStats(res.data));
    axios.get('http://localhost:5000/api/donors/all').then(res => setDonors(res.data));
    axios.get('http://localhost:5000/api/requests/all').then(res => setRequests(res.data));
  }, []);

  if (!isAdmin) return <Navigate to="/admin/login" />;

  const runMatch = async (requestId) => {
    const res = await axios.get(`http://localhost:5000/api/requests/match/${requestId}`);
    setMatchResult({ requestId, ...res.data });
  };

  return (
    <div className="dash-page">
      <div className="dash-header"><h2>Admin Dashboard</h2></div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="num">{stats.totalDonors}</div><div className="lbl">Total Donors</div></div>
          <div className="stat-card"><div className="num">{stats.availableDonors}</div><div className="lbl">Available Donors</div></div>
          <div className="stat-card"><div className="num">{stats.totalRecipients}</div><div className="lbl">Recipients</div></div>
          <div className="stat-card"><div className="num">{stats.totalRequests}</div><div className="lbl">Total Requests</div></div>
          <div className="stat-card"><div className="num">{stats.pendingRequests}</div><div className="lbl">Pending</div></div>
          <div className="stat-card"><div className="num">{stats.fulfilledRequests}</div><div className="lbl">Fulfilled</div></div>
        </div>
      )}

      <h3 className="section-title">Registered Donors ({donors.length})</h3>
      <table className="dash-table">
        <thead><tr><th>Name</th><th>Blood Group</th><th>City</th><th>Available</th></tr></thead>
        <tbody>
          {donors.map(d => (
            <tr key={d._id}><td>{d.name}</td><td>{d.bloodGroup}</td><td>{d.city}</td><td>{d.isAvailable ? 'Yes' : 'No'}</td></tr>
          ))}
        </tbody>
      </table>

      <h3 className="section-title">Emergency Requests ({requests.length})</h3>
      <table className="dash-table">
        <thead><tr><th>Patient</th><th>Blood Group</th><th>Hospital</th><th>City</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {requests.map(r => (
            <tr key={r._id}>
              <td>{r.patientName}</td><td>{r.bloodGroup}</td><td>{r.hospitalName}</td><td>{r.city}</td>
              <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
              <td><button className="accept-btn" onClick={() => runMatch(r._id)}>Run Match</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {matchResult && (
        <>
          <h3 className="section-title">Match Results ({matchResult.matchedDonorsCount} found, within {matchResult.searchRadiusKm} km)</h3>

          {matchResult.request && (
            <div className="match-card" style={{ borderLeft: '4px solid #c0392b', display: 'block' }}>
              <div><strong>Patient:</strong> {matchResult.request.patientName} ({matchResult.request.bloodGroup}, {matchResult.request.unitsRequired} unit(s), {matchResult.request.urgency})</div>
              <div><strong>Hospital:</strong> {matchResult.request.hospitalName}</div>
              <div><strong>Address:</strong> {matchResult.request.hospitalAddress || 'Not provided'}, {matchResult.request.city}</div>
              <div><strong>Contact:</strong> {matchResult.request.contactPerson} — {matchResult.request.contactPhone}</div>
            </div>
          )}

          {matchResult.matchedDonors.map(d => (
            <div className="match-card" key={d._id}>
              <div><strong>{d.name}</strong> — {d.bloodGroup} — {d.city}
                <div className="match-meta">{d.distanceKm} km away • 📞 {d.phone}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
export default AdminDashboard;