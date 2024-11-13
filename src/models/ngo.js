const mongoose = require("mongoose");

const NgoSchema = new mongoose.Schema({
  ngoName: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  yearOfEstablishment: {
    type: Date,
    required: true,
  },
  typeOfNGO: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  website: {
    type: String,
  },
  founders: {
    type: String,
    required: true,
  },
  ceo: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  volunteers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Ngo", NgoSchema);
