import React, { useState } from 'react';
import axios from 'axios';
import './DonorForm.css';

function DonorForm() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    bloodGroup: '',
    phone: '',
    email: '',
    city: '',
    noChronicIllness: false,
    noRecentSurgery: false,
    noRecentDonation: false
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.noChronicIllness || !formData.noRecentSurgery || !formData.noRecentDonation) {
      setIsError(true);
      setMessage('Please confirm all eligibility criteria before submitting.');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        weight: formData.weight,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        eligibility: {
          noChronicIllness: formData.noChronicIllness,
          noRecentSurgery: formData.noRecentSurgery,
          noRecentDonation: formData.noRecentDonation
        }
      };

      await axios.post('https://raktsetu-backend-up1l.onrender.com/api/donors/register', payload);
      setIsError(false);
      setMessage('Donor registered successfully!');
      setFormData({
        name: '', age: '', gender: '', weight: '', bloodGroup: '',
        phone: '', email: '', city: '',
        noChronicIllness: false, noRecentSurgery: false, noRecentDonation: false
      });
    } catch (error) {
      setIsError(true);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error registering donor. Please try again.');
      }
      console.error(error);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>🩸 Donor Registration</h2>
        <p className="subtitle">Join RaktSetu and help save lives in emergencies</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} min="18" max="65" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="45" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Blood Group</label>
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
            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="eligibility-box">
            <h4>Eligibility Confirmation</h4>
            <label className="checkbox-label">
              <input type="checkbox" name="noChronicIllness" checked={formData.noChronicIllness} onChange={handleChange} />
              I do not have any chronic illness (HIV, Hepatitis, Cancer, etc.)
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="noRecentSurgery" checked={formData.noRecentSurgery} onChange={handleChange} />
              I have not had major surgery in the last 6 months
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="noRecentDonation" checked={formData.noRecentDonation} onChange={handleChange} />
              I have not donated blood in the last 90 days
            </label>
          </div>

          <button type="submit" className="submit-btn">Register as Donor</button>
        </form>

        {message && (
          <p className={isError ? 'msg error' : 'msg success'}>{message}</p>
        )}
      </div>
    </div>
  );
}

export default DonorForm;