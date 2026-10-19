const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const Request = require('../models/Request');
const Recipient = require('../models/Recipient');

router.get('/stats', async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const availableDonors = await Donor.countDocuments({ isAvailable: true });
    const totalRecipients = await Recipient.countDocuments();
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'Pending' });
    const fulfilledRequests = await Request.countDocuments({ status: 'Fulfilled' });

    res.status(200).json({
      totalDonors, availableDonors, totalRecipients,
      totalRequests, pendingRequests, fulfilledRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;