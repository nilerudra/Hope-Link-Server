const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const volunteerSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  connectedNgo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ngo",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Volunteer = mongoose.model("User", volunteerSchema);

module.exports = Volunteer;
