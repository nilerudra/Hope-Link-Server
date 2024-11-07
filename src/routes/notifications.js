const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");
const User = require("../models/users");

router.post("/send-join-request-notification", async (req, res) => {
  try {
    const { userId, ngoId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const notification = new Notification({
      id: ngoId,
      userName: user.username,
      message: `${user.username} has requested to join your NGO.`,
    });

    await notification.save();
    res.status(201).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending notification" });
  }
});

// get notifications
router.get("/get-notifications/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const notifications = await Notification.find({
      id: id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// mark as read
router.put("/mark-as-read/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error marking notification as read" });
  }
});

module.exports = router;
