
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

// Validate latitude and longitude.
function hasValidCoordinates(lat, lng) {
  if (lat === null || lat === undefined || lat === '') return false;
  if (lng === null || lng === undefined || lng === '') return false;

  const latitude = Number(lat);
  const longitude = Number(lng);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

// Get request coordinates from the database or resolve them using the city.
function getRequestCoordinates(request) {
  if (hasValidCoordinates(request.latitude, request.longitude)) {
    return {
      lat: Number(request.latitude),
      lng: Number(request.longitude)
    };
  }

  // Older requests may not have saved coordinates.
  const cityCoords = request.city
    ? getCoordinates(request.city)
    : null;

  if (
    cityCoords &&
    hasValidCoordinates(cityCoords.lat, cityCoords.lng)
  ) {
    return {
      lat: Number(cityCoords.lat),
      lng: Number(cityCoords.lng)
    };
  }

  return null;
}

// Create a new blood request.
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

    return res.status(201).json({
      message: 'Blood request submitted successfully',
      request
    });
  } catch (error) {
    console.error('Error submitting request:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(' | ')
      });
    }

    return res.status(400).json({
      message: 'Error submitting request',
      error: error.message
    });
  }
});

// Get all blood requests.
router.get('/all', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);

    return res.status(500).json({
      message: 'Error fetching requests',
      error: error.message
    });
  }
});

// Get requests created by a recipient.
router.get('/by-recipient/:recipientId', async (req, res) => {
  try {
    const requests = await Request.find({
      recipientId: req.params.recipientId
    }).sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching recipient requests:', error);

    return res.status(500).json({
      message: 'Error fetching requests',
      error: error.message
    });
  }
});

// Get requests accepted by a particular donor.
router.get('/by-donor/:donorId', async (req, res) => {
  try {
    const donorId = req.params.donorId;

    const requests = await Request.find({
      respondedDonors: {
        $elemMatch: {
          donorId,
          response: 'Accepted'
        }
      }
    }).sort({ createdAt: -1 });

    const result = requests.map((request) => {
      const mine = request.respondedDonors.find(
        (entry) =>
          entry.donorId &&
          entry.donorId.toString() === donorId &&
          entry.response === 'Accepted'
      );

      return {
        ...request._doc,
        myProgress: (mine && mine.progress) || 'Accepted'
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching donor requests:', error);

    return res.status(500).json({
      message: 'Error fetching accepted requests',
      error: error.message
    });
  }
});

// Get compatible donor blood groups.
router.get('/compatible/:bloodGroup', (req, res) => {
  const bloodGroup = String(req.params.bloodGroup || '')
    .trim()
    .toUpperCase();

  const compatibleGroups = compatibility[bloodGroup];

  if (!compatibleGroups) {
    return res.status(400).json({
      message: 'Invalid blood group'
    });
  }

  return res.status(200).json({
    bloodGroup,
    compatibleDonorGroups: compatibleGroups
  });
});

// Match compatible donors to a blood request.
router.get('/match/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    // Validate the MongoDB ObjectId.
    if (!/^[a-f\d]{24}$/i.test(requestId)) {
      return res.status(400).json({
        message: 'Invalid request ID format'
      });
    }

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      });
    }

    // Resolve coordinates if the request does not have them saved.
    const coords = getRequestCoordinates(request);

    if (!coords) {
      return res.status(400).json({
        message:
          `Location coordinates are unavailable for city "${request.city || 'not provided'}". ` +
          'Add this city to backend/cityCoordinates.js, then retry matching.',
        city: request.city || null
      });
    }

    // Normalize the request blood group.
    const bloodGroup = String(request.bloodGroup || '')
      .trim()
      .toUpperCase();

    const compatibleGroups = compatibility[bloodGroup];

    if (!compatibleGroups) {
      return res.status(400).json({
        message:
          `Invalid blood group in request: "${request.bloodGroup || 'not provided'}". ` +
          'Expected one of O-, O+, A-, A+, B-, B+, AB-, AB+.',
        bloodGroup: request.bloodGroup || null
      });
    }

    // Find available donors with compatible blood groups.
    const candidateDonors = await Donor.find({
      bloodGroup: {
        $in: compatibleGroups
      },
      isAvailable: true,
      latitude: { $ne: null },
      longitude: { $ne: null }
    }).select('-password');

    // Calculate distance and keep donors within the search radius.
    const matchedDonors = candidateDonors
      .filter((donor) =>
        hasValidCoordinates(donor.latitude, donor.longitude)
      )
      .map((donor) => {
        const distance = calculateDistance(
          coords.lat,
          coords.lng,
          Number(donor.latitude),
          Number(donor.longitude)
        );

        return {
          ...donor._doc,
          distanceKm: Math.round(distance * 10) / 10
        };
      })
      .filter(
        (donor) =>
          Number.isFinite(donor.distanceKm) &&
          donor.distanceKm <= SEARCH_RADIUS_KM
      )
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return res.status(200).json({
      request: {
        patientName: request.patientName,
        bloodGroup,
        city: request.city,
        urgency: request.urgency,
        unitsRequired: request.unitsRequired,
        hospitalName: request.hospitalName,
        hospitalAddress: request.hospitalAddress || '',
        contactPerson: request.contactPerson,
        contactPhone: request.contactPhone
      },
      searchRadiusKm: SEARCH_RADIUS_KM,
      matchedDonorsCount: matchedDonors.length,
      matchedDonors
    });
  } catch (error) {
    console.error('Error finding matches:', error);

    return res.status(500).json({
      message: 'Error finding matches',
      error: error.message
    });
  }
});

// Record a donor's response to a request.
router.post('/:requestId/respond', async (req, res) => {
  try {
    const { donorId, response } = req.body;

    if (
      !donorId ||
      !['Accepted', 'Declined'].includes(response)
    ) {
      return res.status(400).json({
        message:
          'donorId and a valid response (Accepted/Declined) are required'
      });
    }

    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      });
    }

    const alreadyResponded = (request.respondedDonors || []).some(
      (entry) =>
        entry.donorId &&
        entry.donorId.toString() === donorId
    );

    if (alreadyResponded) {
      return res.status(400).json({
        message: 'You have already responded to this request'
      });
    }

    request.respondedDonors.push({
      donorId,
      response
    });

    if (response === 'Accepted') {
      request.status = 'Fulfilled';

      await Donor.findByIdAndUpdate(donorId, {
        isAvailable: false,
        lastDonationDate: new Date()
      });
    }

    await request.save();

    return res.status(200).json({
      message: `Response recorded: ${response}`,
      request
    });
  } catch (error) {
    console.error('Error recording donor response:', error);

    return res.status(500).json({
      message: 'Error recording response',
      error: error.message
    });
  }
});

// Get donors who accepted a request, including progress and location.
router.get('/:requestId/accepted-donors', async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      });
    }

    const accepted = (request.respondedDonors || []).filter(
      (entry) => entry.response === 'Accepted'
    );

    const donors = await Donor.find({
      _id: {
        $in: accepted.map((entry) => entry.donorId)
      }
    }).select('-password');

    const result = donors.map((donor) => {
      const entry = accepted.find(
        (acceptedEntry) =>
          acceptedEntry.donorId.toString() === donor._id.toString()
      );

      let distanceKm = null;

      if (
        hasValidCoordinates(request.latitude, request.longitude) &&
        hasValidCoordinates(donor.latitude, donor.longitude)
      ) {
        distanceKm = Math.round(
          calculateDistance(
            Number(request.latitude),
            Number(request.longitude),
            Number(donor.latitude),
            Number(donor.longitude)
          ) * 10
        ) / 10;
      }

      return {
        _id: donor._id,
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        phone: donor.phone,
        city: donor.city,
        distanceKm,
        progress: entry.progress || 'Accepted',
        progressUpdatedAt:
          entry.progressUpdatedAt || entry.respondedAt,
        lat: entry.currentLat != null ? entry.currentLat : null,
        lng: entry.currentLng != null ? entry.currentLng : null,
        locationUpdatedAt: entry.locationUpdatedAt || null
      };
    });

    return res.status(200).json({
      acceptedCount: result.length,
      donors: result
    });
  } catch (error) {
    console.error('Error fetching accepted donors:', error);

    return res.status(500).json({
      message: 'Error fetching accepted donors',
      error: error.message
    });
  }
});

// Update a donor's progress for an accepted request.
router.patch('/:requestId/donor-progress', async (req, res) => {
  try {
    const { donorId, progress } = req.body;

    const allowedProgress = [
      'On the way',
      'Reached hospital',
      'Donated'
    ];

    if (!donorId || !allowedProgress.includes(progress)) {
      return res.status(400).json({
        message: 'donorId and a valid progress value are required'
      });
    }

    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      });
    }

    const entry = (request.respondedDonors || []).find(
      (item) =>
        item.donorId &&
        item.donorId.toString() === donorId &&
        item.response === 'Accepted'
    );

    if (!entry) {
      return res.status(404).json({
        message: 'Accepted response not found for this donor'
      });
    }

    entry.progress = progress;
    entry.progressUpdatedAt = new Date();

    await request.save();

    return res.status(200).json({
      message: `Status updated: ${progress}`,
      progress
    });
  } catch (error) {
    console.error('Error updating donor progress:', error);

    return res.status(500).json({
      message: 'Error updating progress',
      error: error.message
    });
  }
});

// Save a donor's current location for an accepted request.
router.patch('/:requestId/donor-location', async (req, res) => {
  try {
    const { donorId, lat, lng } = req.body;

    if (
      !donorId ||
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        message:
          'donorId and valid numeric latitude/longitude are required'
      });
    }

    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      });
    }

    const entry = (request.respondedDonors || []).find(
      (item) =>
        item.donorId &&
        item.donorId.toString() === donorId &&
        item.response === 'Accepted'
    );

    if (!entry) {
      return res.status(404).json({
        message: 'Accepted response not found for this donor'
      });
    }

    entry.currentLat = lat;
    entry.currentLng = lng;
    entry.locationUpdatedAt = new Date();

    await request.save();

    return res.status(200).json({
      message: 'Location updated'
    });
  } catch (error) {
    console.error('Error updating donor location:', error);

    return res.status(500).json({
      message: 'Error updating location',
      error: error.message
    });
  }
});

module.exports = router;

