const express = require("express");
const router = express.Router();
const Ngo = require("../models/ngo");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JoinRequest = require("../models/joinRequest");
const Notification = require("../models/notification");

router.post("/sign-up", async (req, res) => {
  const {
    ngoName,
    registrationNumber,
    yearOfEstablishment,
    typeOfNGO,
    country,
    state,
    city,
    address,
    contactNumber,
    email,
    website,
    founders,
    ceo,
    password,
  } = req.body;

  try {
    let existingNgo = await Ngo.findOne({ email });
    if (existingNgo) {
      return res.status(400).json({
        errorField: "email",
        message: "NGO with this email already exists",
      });
    }

    existingNgo = await Ngo.findOne({ registrationNumber });
    if (existingNgo) {
      return res.status(400).json({
        errorField: "registrationNumber",
        message: "NGO with this registration number already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newNgo = new Ngo({
      ngoName,
      registrationNumber,
      yearOfEstablishment,
      typeOfNGO,
      country,
      state,
      city,
      address,
      contactNumber,
      email,
      website,
      founders,
      ceo,
      password: hashedPassword,
      volunteers: [],
    });

    await newNgo.save();
    res.status(201).json({
      message: "NGO registered successfully",
      ngoId: newNgo._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during registration" });
  }
});

router.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Ngo.findOne({ email });
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
      message: "Login Successful.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/get-all-ngo", async (req, res) => {
  try {
    const users = await Ngo.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Join Request
router.post("/join", async (req, res) => {
  const { userId, ngoId } = req.body;

  const user = await User.findById(userId);
  try {
    // Find an existing request for this user and NGO
    let existingRequest = await JoinRequest.findOne({ userId, ngoId });

    if (existingRequest) {
      // Toggle status between 'Pending' and 'Withdrawn'
      existingRequest.status =
        existingRequest.status === "Pending" ? "Withdrawn" : "Pending";
      await existingRequest.save();

      const message =
        existingRequest.status === "Pending"
          ? `${user.username} reactivated join request`
          : `${user.username} withdrawn join request`;

      // Create a notification for the NGO about the status change
      const notificationMessage = `${message} for your NGO.`;
      const notification = new Notification({
        id: ngoId,
        userName: user.username,
        message: notificationMessage,
      });

      await notification.save();

      return res.json({ message, request: existingRequest });
    }

    // Create a new join request if none exists
    const newRequest = new JoinRequest({ userId, ngoId });
    await newRequest.save();

    // Create a notification for the NGO
    const notificationMessage = `${user.username} has requested to join your NGO.`;

    const notification = new Notification({
      id: ngoId,
      userName: user.username,
      message: notificationMessage,
    });

    await notification.save();

    res.json({
      message: "Join request sent successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process join request" });
  }
});

router.get("/get-users-requests/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const joinRequests = await JoinRequest.find({ userId });
    res.json(joinRequests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch join requests" });
  }
});

module.exports = router;
