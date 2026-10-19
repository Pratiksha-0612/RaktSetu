const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Donor must be at least 18 years old'],
    max: [65, 'Donor must be under 65 years old']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Please select a valid gender'
    }
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [45, 'Donor must weigh at least 45 kg to be eligible']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Please select a valid blood group'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
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
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  eligibility: {
    noChronicIllness: { type: Boolean, required: [true, 'Chronic illness confirmation is required'] },
    noRecentSurgery: { type: Boolean, required: [true, 'Recent surgery confirmation is required'] },
    noRecentDonation: { type: Boolean, required: [true, 'Recent donation confirmation is required'] }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donor', donorSchema);