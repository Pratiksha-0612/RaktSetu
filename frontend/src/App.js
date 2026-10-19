import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Team from './pages/Team';
import MatchingEngineInfo from './pages/MatchingEngineInfo';

import DonorSignup from './components/DonorSignup';
import DonorLogin from './components/DonorLogin';
import DonorDashboard from './components/DonorDashboard';
import RecipientSignup from './components/RecipientSignup';
import RecipientLogin from './components/RecipientLogin';
import RecipientDashboard from './components/RecipientDashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/team" element={<Team />} />
          <Route path="/matching-engine" element={<MatchingEngineInfo />} />

          <Route path="/donor/signup" element={<DonorSignup />} />
          <Route path="/donor/login" element={<DonorLogin />} />
          <Route path="/donor/dashboard" element={<DonorDashboard />} />

          <Route path="/recipient/signup" element={<RecipientSignup />} />
          <Route path="/recipient/login" element={<RecipientLogin />} />
          <Route path="/recipient/dashboard" element={<RecipientDashboard />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;