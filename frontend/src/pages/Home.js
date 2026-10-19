import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>🩸 RaktSetu</h1>
        <p>A Real-Time Blood Donor-Recipient Matching System</p>
        <div className="hero-btns">
          <Link to="/donor/signup" className="hero-btn primary">Become a Donor</Link>
          <Link to="/recipient/signup" className="hero-btn secondary">Request Blood</Link>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat"><div className="num">8</div><div className="lbl">Blood Groups Supported</div></div>
        <div className="stat"><div className="num">100km</div><div className="lbl">Search Radius</div></div>
        <div className="stat"><div className="num">90</div><div className="lbl">Day Donor Cooldown</div></div>
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step"><div className="step-num">1</div><h4>Donor Registers</h4><p>Blood group, location, and health eligibility.</p></div>
          <div className="step"><div className="step-num">2</div><h4>Request Submitted</h4><p>Hospital or recipient submits an emergency request.</p></div>
          <div className="step"><div className="step-num">3</div><h4>Auto Matching</h4><p>Compatibility + real distance matching, instantly.</p></div>
          <div className="step"><div className="step-num">4</div><h4>Donor Responds</h4><p>Accept or decline directly from their dashboard.</p></div>
        </div>
      </div>
    </div>
  );
}
export default Home;