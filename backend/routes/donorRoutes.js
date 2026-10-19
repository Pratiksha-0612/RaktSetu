const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const Request = require('../models/Request');
const { getCoordinates } = require('../cityCoordinates');
const { calculateDistance } = require('../distanceCalculator');

const compatibility = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

const SEARCH_RADIUS_KM = 100;

router.post('/register', async (req, res) => {
  try {
    const coords = getCoordinates(req.body.city);
    const donorData = {
      ...req.body,
      latitude: coords ? coords.lat : null,
      longitude: coords ? coords.lng : null
    };
    const donor = new Donor(donorData);
    await donor.save();
    res.status(201).json({ message: 'Donor registered successfully', donor });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(' | ') });
    }
    if (error.code === 11000) return res.status(400).json({ message: 'This email is already registered.' });
    res.status(400).json({ message: 'Error registering donor', error: error.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const donors = await Donor.find();
    res.status(200).json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donors', error: error.message });
  }
});

router.get('/by-email/:email', async (req, res) => {
  try {
    const donor = await Donor.findOne({ email: req.params.email.trim().toLowerCase() });
    if (!donor) return res.status(404).json({ message: 'No donor found with this email' });
    res.status(200).json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Error finding donor', error: error.message });
  }
});

router.get('/:donorId/matches', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.donorId);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    if (!donor.latitude || !donor.longitude) {
      return res.status(400).json({ message: 'Donor location not available' });
    }

    const pendingRequests = await Request.find({
      status: 'Pending',
      latitude: { $ne: null },
      longitude: { $ne: null }
    });

    const matches = pendingRequests
      .filter((request) => {
        const compatibleDonorGroups = compatibility[request.bloodGroup] || [];
        if (!compatibleDonorGroups.includes(donor.bloodGroup)) return false;
        const alreadyResponded = (request.respondedDonors || []).some(
          (r) => r.donorId && r.donorId.toString() === donor._id.toString()
        );
        return !alreadyResponded;
      })
      .map((request) => {
        const distance = calculateDistance(donor.latitude, donor.longitude, request.latitude, request.longitude);
        return { ...request._doc, distanceKm: Math.round(distance * 10) / 10 };
      })
      .filter((request) => request.distanceKm <= SEARCH_RADIUS_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json({ donorName: donor.name, matchesCount: matches.length, matches });
  } catch (error) {
    res.status(500).json({ message: 'Error finding matches', error: error.message });
  }
});

module.exports = router;