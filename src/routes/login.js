const express = require("express");
const router = express.Router();
const Volunteer = require("../models/users");
const Post = require("../models/posts");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Donation = require("../models/donar");
const mongoose = require('mongoose');
const Donar = require("../models/donar");

// Get total donations by a volunteer



router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Volunteer.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.json({
      token,
      user_id: user._id,
      message: "Login successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint to get user profile information
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await Volunteer.findById(
      req.params.id,
      "username email role createdAt"
    );
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

// Endpoint to get user's posts
router.get("/profile/:id/posts", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

router.get("/:userId/connected-ngos/count", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by ID
    const user = await Volunteer.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Assuming the user has a field called 'connectedNgos' which is an array of NGO IDs
    const connectedNgoCount = user.connectedNgo.length;

    // Respond with the count of connected NGOs
    res.json({ count: connectedNgoCount });
  } catch (err) {
    console.error("Error fetching connected NGOs count:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/profile/:id/donation", async (req, res) => {
  try {
    const userId = req.params.id;

    // Aggregate donations for the volunteer
    const totalDonations = await Donar.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } }, 
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    // If no donations found, return 0
    const totalAmount = totalDonations.length > 0 ? totalDonations[0].totalAmount : 0;

    res.status(200).json({ totalAmount });
  } catch (error) {
    console.error("Error fetching total donations:", error);
    res.status(500).json({ message: "Error fetching total donations" });
  }
});


module.exports = router;
