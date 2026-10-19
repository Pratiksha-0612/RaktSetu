const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Please select a valid blood group'
    }
  },
  unitsRequired: {
    type: Number,
    required: [true, 'Units required is needed'],
    min: [1, 'At least 1 unit must be requested']
  },
  urgency: {
    type: String,
    required: [true, 'Urgency level is required'],
    enum: {
      values: ['Critical', 'High', 'Normal'],
      message: 'Please select a valid urgency level'
    }
  },
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required']
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required']
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipient'
  },
  status: {
    type: String,
    enum: ['Pending', 'Fulfilled', 'Expired'],
    default: 'Pending'
  },
  respondedDonors: [
    {
      donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
      response: { type: String, enum: ['Accepted', 'Declined'] },
      respondedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', requestSchema);