const express = require("express");
const router = express.Router();
const Ngo = require("../models/ngo");
const User = require("../models/users");
const Post = require("../models/posts");
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

// all ngos
router.get("/get-all-ngo:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    // Find the user to get the connected NGOs
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all NGOs excluding those the user is already connected to
    const ngos = await Ngo.find({
      _id: { $nin: user.connectedNgo }, // Use $nin to exclude NGOs already connected
    });

    res.json(ngos); // Send back the list of NGOs
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ngo details by id
router.get("/:ngoId", async (req, res) => {
  const { ngoId } = req.params;

  try {
    // Find the NGO by ID
    const ngo = await Ngo.findById(ngoId);

    if (!ngo) {
      return res.status(404).json({ error: "NGO not found" });
    }

    // Return the NGO details
    res.json(ngo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch NGO details" });
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

// Accept a volunteer request for a specific NGO
router.post("/:ngoId/accept-volunteer", async (req, res) => {
  try {
    const ngoId = req.params.ngoId;
    const { requestId } = req.body;

    // Find the NGO to ensure it exists
    const ngo = await Ngo.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    // Find the volunteer request by requestId
    const request = await JoinRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Check if the request is already accepted or denied
    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Request is already processed" });
    }

    // Update the request status to 'Accepted'
    request.status = "Accepted";
    await request.save();

    // Update the user document to store the NGO's ID
    const user = await User.findById(request.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.connectedNgo.includes(ngoId)) {
      user.connectedNgo.push(ngoId); // Only add if not already in the list
      await user.save();
    }

    // Add user ID to NGO's volunteers array if not already present
    if (!ngo.volunteers.includes(request.userId.toString())) {
      ngo.volunteers.push(request.userId); // Push user ID
      await ngo.save();
    } else {
      console.log("User already in volunteers array");
    }

    // Create a notification for the user
    const notification = new Notification({
      id: request.userId,
      userName: ngo.ngoName,
      message: `${ngo.ngoName} has accepted your request.`,
    });
    await notification.save();

    // Respond with the updated request
    res.json({ message: "Volunteer request accepted", request });
  } catch (err) {
    console.error("Error accepting volunteer request", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Deny a volunteer request for a specific NGO
router.post("/:ngoId/deny-volunteer", async (req, res) => {
  try {
    const ngoId = req.params.ngoId;
    const { requestId } = req.body;

    // Find the NGO to ensure it exists
    const ngo = await Ngo.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    // Find the volunteer request by requestId
    const request = await JoinRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Check if the request is already accepted or denied
    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Request is already processed" });
    }

    // Update the request status to 'Denied'
    request.status = "Withdrawn";
    await request.save();

    // Create a notification for the NGO
    const notificationMessage = `${ngo.ngoName} has denied your request.`;

    const notification = new Notification({
      id: request.userId,
      userName: ngo.ngoName,
      message: notificationMessage,
    });

    await notification.save();

    // Respond with the updated request
    res.json({ message: "Volunteer request denied", request });
  } catch (err) {
    console.error("Error denying volunteer request", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all volunteer requests for a specific NGO
router.get("/:ngoId/volunteer-requests", async (req, res) => {
  try {
    const ngoId = req.params.ngoId;

    // Find the NGO to ensure it exists
    const ngo = await Ngo.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    // Fetch all volunteer requests for the given NGO
    const requests = await JoinRequest.find({
      ngoId: ngoId,
      status: "Pending",
    })
      .populate("userId", "username") // Assuming 'userId' references a User model and you want the 'name' field
      .exec();

    // Return the requests
    res.json(requests);
  } catch (err) {
    console.error("Error fetching volunteer requests", err);
    res.status(500).json({ message: "Server error" });
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

// Route to get all connected NGOs for a specific volunteer
router.get("/:userId/connected-ngo-details", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Step 1: Get the volunteer from the volunteer database
    const volunteer = await User.findById(userId).populate({
      path: "connectedNgo",
      model: Ngo, // Specify Ngo as the model for population
    });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    // Step 2: Get NGO details from the NGO database for all connected NGOs
    const ngoDetails = await Ngo.find({
      _id: { $in: volunteer.connectedNgo.map((ngo) => ngo._id) },
    });

    if (!ngoDetails || ngoDetails.length === 0) {
      return res.status(404).json({ message: "No connected NGOs found" });
    }

    // Return the NGO details to the client
    res.status(200).json({ connectedNgos: ngoDetails });
  } catch (error) {
    console.error("Error fetching connected NGOs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to fetch all posts of volunteers associated with a specific NGO
router.get("/:ngoId/volunteers/posts", async (req, res) => {
  console.log("hiii");
  try {
    const { ngoId } = req.params;

    // Find the NGO and populate the volunteers field
    const ngo = await Ngo.findById(ngoId).populate("volunteers");

    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    // Get the list of volunteer IDs associated with the NGO
    const volunteerIds = ngo.volunteers.map((volunteer) => volunteer);

    // Find all posts by these volunteers
    const posts = await Post.find({ userId: { $in: volunteerIds } });

    console.log("post" + posts);
    res.status(200).json({ post: posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
