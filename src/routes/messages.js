const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/messageSchema");

// Route to send a message
router.post("/send", async (req, res) => {
  const { sender, receiver, text } = req.body;
  console.log(sender + " " + receiver + " " + text);

  try {
    const newMessage = new Message({
      sender: sender,
      receiver: receiver,
      text,
    });

    await newMessage.save();
    console.log("sent");
    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

router.get("/conversation/:ngoId", async (req, res) => {
  const { ngoId } = req.params;

  try {
    // Find messages where receiver is ngoId
    const messages = await Message.find({
      receiver: ngoId, // Fetch only messages where receiver matches ngoId
    }).sort({ created_at: 1 }); // Sort by creation date

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
