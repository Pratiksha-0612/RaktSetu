import React from 'react';
import './LandingPage.css';

function LandingPage({ onDonor, onPatient, onAdmin }) {
  return (
    <div className="landing-page">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-drop">🩸</span>
          <span>Rakt<span>Setu</span></span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>

        <button className="login-nav-btn" onClick={onDonor}>
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" id="home">

        <div className="hero-content">
          <div className="hero-badge">
            ❤️ Every Drop Counts
          </div>

          <h1>
            Donate Blood.
            <br />
            <span>Save Lives.</span>
          </h1>

          <p>
            RaktSetu connects blood donors with patients in need,
            making blood available when every second matters.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={onDonor}>
              🩸 Become a Donor
            </button>

            <button className="secondary-btn" onClick={onPatient}>
              🔍 Find Blood
            </button>
          </div>

          <div className="trust-text">
            Trusted platform for connecting donors and patients
          </div>
        </div>

        <div className="hero-visual">
          <div className="blood-circle">
            <div className="blood-icon">🩸</div>
          </div>

          <div className="floating-card card-one">
            <span>🩸</span>
            <div>
              <strong>Blood Donation</strong>
              <small>Give someone another chance</small>
            </div>
          </div>

          <div className="floating-card card-two">
            <span>📍</span>
            <div>
              <strong>Nearby Donors</strong>
              <small>Find donors around you</small>
            </div>
          </div>
        </div>

      </section>

      {/* Statistics */}
      <section className="stats-section">
        <div className="stat-box">
          <strong>100+</strong>
          <span>Donors</span>
        </div>

        <div className="stat-box">
          <strong>50+</strong>
          <span>Blood Requests</span>
        </div>

        <div className="stat-box">
          <strong>8</strong>
          <span>Blood Groups</span>
        </div>

        <div className="stat-box">
          <strong>24/7</strong>
          <span>Emergency Support</span>
        </div>
      </section>

      {/* About */}
      <section className="about-section" id="about">
        <div className="section-heading">
          <span>ABOUT RAKTSETU</span>
          <h2>Connecting people when it matters most</h2>
          <p>
            RaktSetu is a blood donation management platform designed
            to help patients find compatible blood donors quickly.
          </p>
        </div>

        <div className="feature-grid" id="services">

          <div className="feature-card">
            <div className="feature-icon">🩸</div>
            <h3>Find Blood</h3>
            <p>
              Submit an emergency blood request and find compatible
              donors.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Nearby Donors</h3>
            <p>
              Our matching system helps identify available donors
              based on location.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick Response</h3>
            <p>
              Connect patients and donors faster during emergency
              situations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure Platform</h3>
            <p>
              Donor and patient information is managed through a
              structured system.
            </p>
          </div>

        </div>
      </section>

      {/* User Types */}
      <section className="user-section">

        <div className="user-card donor-card">
          <div className="user-card-icon">🩸</div>
          <h2>Are you a Donor?</h2>
          <p>
            Register yourself and help someone in an emergency.
          </p>
          <button onClick={onDonor}>
            Donor Sign In / Sign Up →
          </button>
        </div>

        <div className="user-card patient-card">
          <div className="user-card-icon">🏥</div>
          <h2>Need Blood?</h2>
          <p>
            Find compatible blood donors near your location.
          </p>
          <button onClick={onPatient}>
            Patient Login →
          </button>
        </div>

        <div className="user-card admin-card">
          <div className="user-card-icon">🔐</div>
          <h2>Administrator</h2>
          <p>
            Manage donors, patients and blood requests.
          </p>
          <button onClick={onAdmin}>
            Admin Login →
          </button>
        </div>

      </section>

      {/* Contact */}
      <section className="contact-section" id="contact">
        <h2>Need help during an emergency?</h2>
        <p>
          RaktSetu helps connect patients with compatible blood donors.
        </p>
        <button onClick={onPatient}>
          Request Blood Now
        </button>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-logo">
          🩸 RaktSetu
        </div>

        <p>
          Connecting donors. Saving lives.
        </p>

        <span>
          © 2026 RaktSetu. All rights reserved.
        </span>
      </footer>

    </div>
  );
}

export default LandingPage;