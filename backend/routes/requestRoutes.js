const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Donor = require('../models/Donor');
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

router.post('/create', async (req, res) => {
  try {
    const coords = getCoordinates(req.body.city);
    const requestData = {
      ...req.body,
      latitude: coords ? coords.lat : null,
      longitude: coords ? coords.lng : null
    };
    const request = new Request(requestData);
    await request.save();
    res.status(201).json({ message: 'Blood request submitted successfully', request });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(' | ') });
    }
    res.status(400).json({ message: 'Error submitting request', error: error.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

router.get('/by-recipient/:recipientId', async (req, res) => {
  try {
    const requests = await Request.find({ recipientId: req.params.recipientId }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

router.get('/compatible/:bloodGroup', (req, res) => {
  const { bloodGroup } = req.params;
  const compatibleGroups = compatibility[bloodGroup];
  if (!compatibleGroups) return res.status(400).json({ message: 'Invalid blood group' });
  res.status(200).json({ bloodGroup, compatibleDonorGroups: compatibleGroups });
});

router.get('/match/:requestId', async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (!request.latitude || !request.longitude) {
      return res.status(400).json({ message: 'Request location coordinates not available. City may not be in our database yet.' });
    }

    const compatibleGroups = compatibility[request.bloodGroup];
    if (!compatibleGroups) return res.status(400).json({ message: 'Invalid blood group in request' });

    const candidateDonors = await Donor.find({
      bloodGroup: { $in: compatibleGroups },
      isAvailable: true,
      latitude: { $ne: null },
      longitude: { $ne: null }
    });

    const matchedDonors = candidateDonors
      .map((donor) => {
        const distance = calculateDistance(request.latitude, request.longitude, donor.latitude, donor.longitude);
        return { ...donor._doc, distanceKm: Math.round(distance * 10) / 10 };
      })
      .filter((donor) => donor.distanceKm <= SEARCH_RADIUS_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json({
      request: {
        patientName: request.patientName,
        bloodGroup: request.bloodGroup,
        city: request.city,
        urgency: request.urgency
      },
      searchRadiusKm: SEARCH_RADIUS_KM,
      matchedDonorsCount: matchedDonors.length,
      matchedDonors
    });
  } catch (error) {
    res.status(500).json({ message: 'Error finding matches', error: error.message });
  }
});

router.post('/:requestId/respond', async (req, res) => {
  try {
    const { donorId, response } = req.body;
    if (!donorId || !['Accepted', 'Declined'].includes(response)) {
      return res.status(400).json({ message: 'donorId and a valid response (Accepted/Declined) are required' });
    }

    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const alreadyResponded = (request.respondedDonors || []).some(
      (r) => r.donorId && r.donorId.toString() === donorId
    );
    if (alreadyResponded) return res.status(400).json({ message: 'You have already responded to this request' });

    request.respondedDonors.push({ donorId, response });

    if (response === 'Accepted') {
      request.status = 'Fulfilled';
      await Donor.findByIdAndUpdate(donorId, { isAvailable: false, lastDonationDate: new Date() });
    }

    await request.save();
    res.status(200).json({ message: `Response recorded: ${response}`, request });
  } catch (error) {
    res.status(500).json({ message: 'Error recording response', error: error.message });
  }
});

module.exports = router;