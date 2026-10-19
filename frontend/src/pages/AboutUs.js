import React from 'react';

function AboutUs() {
  return (
    <div style={{ maxWidth: 800, margin: '50px auto', padding: '0 20px', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <h1 style={{ color: '#b71c1c' }}>About RaktSetu</h1>
      <p style={{ lineHeight: 1.7, color: '#333' }}>
        RaktSetu is a real-time blood donor-recipient matching platform built to solve a critical gap in
        emergency healthcare — the slow, manual process of finding a compatible blood donor. Existing systems
        rely on static directories where recipients must search and call donors individually, with no automatic
        compatibility checking and no real distance-based matching.
      </p>
      <p style={{ lineHeight: 1.7, color: '#333' }}>
        Our platform automates this entire process: donors register with their blood group, location, and health
        eligibility, and when a hospital or recipient submits an emergency request, RaktSetu automatically applies
        a blood-group compatibility engine and calculates real geographic distance using the Haversine formula to
        find the nearest, most suitable donors.
      </p>
      <h2 style={{ color: '#b71c1c', marginTop: 30 }}>Our Mission</h2>
      <p style={{ lineHeight: 1.7, color: '#333' }}>
        To reduce the time and effort required to find a blood donor during emergencies, ultimately helping save lives.
      </p>
    </div>
  );
}
export default AboutUs;