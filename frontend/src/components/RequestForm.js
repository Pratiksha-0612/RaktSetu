import React, { useState } from 'react';
import axios from 'axios';
import './RequestForm.css';

function RequestForm() {
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    unitsRequired: '',
    urgency: '',
    hospitalName: '',
    city: '',
    contactPerson: '',
    contactPhone: ''
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [matchedDonors, setMatchedDonors] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMatchedDonors(null);
    try {
      const res = await axios.post('https://raktsetu-backend-up1l.onrender.com/api/requests/create', formData);
      setIsError(false);
      setMessage('Blood request submitted successfully! Searching for matching donors...');

      const requestId = res.data.request._id;

      setSearching(true);
      const matchRes = await axios.get(`https://raktsetu-backend-up1l.onrender.com/api/requests/match/${requestId}`);
      setSearching(false);
      setMatchedDonors(matchRes.data.matchedDonors);

      setFormData({
        patientName: '', bloodGroup: '', unitsRequired: '', urgency: '',
        hospitalName: '', city: '', contactPerson: '', contactPhone: ''
      });
    } catch (error) {
      setSearching(false);
      setIsError(true);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error submitting request. Please try again.');
      }
      console.error(error);
    }
  };

  return (
    <div className="request-page">
      <div className="request-card">
        <h2>🚨 Emergency Blood Request</h2>
        <p className="subtitle">Submit a request and get matched with nearby donors instantly</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Patient Name</label>
              <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Blood Group Needed</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Units Required</label>
              <input type="number" name="unitsRequired" value={formData.unitsRequired} onChange={handleChange} min="1" required />
            </div>
            <div className="form-group">
              <label>Urgency Level</label>
              <select name="urgency" value={formData.urgency} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hospital Name</label>
              <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Person</label>
              <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="submit-btn">Submit Request</button>
        </form>

        {message && (
          <p className={isError ? 'msg error' : 'msg success'}>{message}</p>
        )}

        {searching && <p className="msg">🔍 Searching for compatible donors nearby...</p>}

        {matchedDonors && (
          <div className="matches-section">
            <h3>{matchedDonors.length} Matching Donor{matchedDonors.length !== 1 ? 's' : ''} Found</h3>
            {matchedDonors.length === 0 && (
              <p>No compatible donors found nearby yet. Try widening the search or check back later.</p>
            )}
            {matchedDonors.map((donor) => (
              <div key={donor._id} className="donor-card">
                <div>
                  <strong>{donor.name}</strong> — {donor.bloodGroup}
                  <br />
                  <span className="donor-meta">{donor.city} • {donor.distanceKm} km away</span>
                </div>
                <div className="donor-contact">{donor.phone}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestForm;