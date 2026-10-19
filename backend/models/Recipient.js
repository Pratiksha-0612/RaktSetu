const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  email: { type: String, required: [true, 'Email is required'], unique: true },
  password: { type: String, required: [true, 'Password is required'] },
  phone: { type: String, required: [true, 'Phone is required'] },
  hospitalName: { type: String },
  city: { type: String, required: [true, 'City is required'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipient', recipientSchema);