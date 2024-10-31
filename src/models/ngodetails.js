const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ngoSchema=new Schema({
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
        type: String,
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
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      },
      website: {
        type: String,
        required: false,
      },
      founders: {
        type: String,
        required: true,
      },
      ceo: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },

})


const Ngo = mongoose.model("Ngo", ngoSchema);

module.exports = Ngo;