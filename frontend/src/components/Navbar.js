import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { donor, recipient, isAdmin, logoutAll } = useAuth();
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAll();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">🩸 RaktSetu</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About Us</Link>
        <Link to="/team">Team</Link>
        <Link to="/matching-engine">Matching Engine</Link>

        {!donor && !recipient && (
          <div className="nav-dropdown" onMouseEnter={() => setOpenMenu('donor')} onMouseLeave={() => setOpenMenu(null)}>
            <span>Donor ▾</span>
            {openMenu === 'donor' && (
              <div className="dropdown-content">
                <Link to="/donor/login">Login</Link>
                <Link to="/donor/signup">Sign Up</Link>
              </div>
            )}
          </div>
        )}

        {!donor && !recipient && (
          <div className="nav-dropdown" onMouseEnter={() => setOpenMenu('recipient')} onMouseLeave={() => setOpenMenu(null)}>
            <span>Recipient ▾</span>
            {openMenu === 'recipient' && (
              <div className="dropdown-content">
                <Link to="/recipient/login">Login</Link>
                <Link to="/recipient/signup">Sign Up</Link>
              </div>
            )}
          </div>
        )}

        {!isAdmin && !donor && !recipient && <Link to="/admin/login">Admin</Link>}

        {donor && <Link to="/donor/dashboard">My Dashboard</Link>}
        {recipient && <Link to="/recipient/dashboard">My Dashboard</Link>}
        {isAdmin && <Link to="/admin/dashboard">Admin Panel</Link>}

        {(donor || recipient || isAdmin) && (
          <button className="nav-logout" onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  );
}
export default Navbar;