const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }
});

const Donor = mongoose.model('Donor', donorSchema);

module.exports = Donor;
