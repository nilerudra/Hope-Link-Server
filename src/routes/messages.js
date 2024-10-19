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

router.get("/conversation/:sender/:receiver", async (req, res) => {
  const { sender, receiver } = req.params;

  try {
    // Find messages where user1 is the sender and user2 is the receiver or vice versa
    const messages = await Message.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
