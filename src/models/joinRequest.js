// models/JoinRequest.js
const mongoose = require("mongoose");

const JoinRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Assuming a User model exists
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "NGO", // Assuming an NGO model exists
  },
  status: {
    type: String,
    enum: ["Pending", "Withdrawn", "Accepted"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("JoinRequest", JoinRequestSchema);
