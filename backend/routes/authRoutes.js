const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const Recipient = require('../models/Recipient');
const { getCoordinates } = require('../cityCoordinates');

router.post('/donor/signup', async (req, res) => {
  try {
    const coords = getCoordinates(req.body.city);
    const donor = new Donor({
      ...req.body,
      latitude: coords ? coords.lat : null,
      longitude: coords ? coords.lng : null
    });
    await donor.save();
    res.status(201).json({ message: 'Donor account created successfully', donor });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(' | ') });
    }
    if (error.code === 11000) return res.status(400).json({ message: 'Email already registered' });
    res.status(400).json({ message: 'Signup failed', error: error.message });
  }
});

router.post('/donor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const donor = await Donor.findOne({ email: email.trim().toLowerCase() });
    if (!donor || donor.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.status(200).json({ message: 'Login successful', donor });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.post('/recipient/signup', async (req, res) => {
  try {
    const recipient = new Recipient(req.body);
    await recipient.save();
    res.status(201).json({ message: 'Recipient account created successfully', recipient });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(' | ') });
    }
    if (error.code === 11000) return res.status(400).json({ message: 'Email already registered' });
    res.status(400).json({ message: 'Signup failed', error: error.message });
  }
});

router.post('/recipient/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const recipient = await Recipient.findOne({ email: email.trim().toLowerCase() });
    if (!recipient || recipient.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.status(200).json({ message: 'Login successful', recipient });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ message: 'Admin login successful' });
  }
  res.status(401).json({ message: 'Invalid admin credentials' });
});

module.exports = router;