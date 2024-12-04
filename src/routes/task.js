const express = require('express');
const Task = require('../models/assign-task');
const Notification = require("../models/notification");
const NGO = require("../models/ngo"); 
const User = require("../models/users");
const router = express.Router();

// Route to create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, ngoId } = req.body;

    // Validate data
    if (!title || !description || !dueDate || !ngoId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create a new task instance
    const newTask = new Task({
      title,
      description,
      dueDate,
      ngoId,
    });

    // Save the task to the database
    const savedTask = await newTask.save();

    const ngo = await NGO.findById(ngoId).populate("volunteers"); // Ensure the "volunteers" field is populated
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    // Create notifications for each volunteer
    const notifications = ngo.volunteers.map((volunteer) => ({
      id: volunteer._id,
      userName: volunteer.username,
      message: ` "${description}" has been assigned to you.`,
      isRead:false
    }));

    await Notification.insertMany(notifications);


    res.status(201).json({ message: 'Task created successfully!', task: savedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the task.', error });
  }
});

// Route to get all tasks for a specific NGO
router.get('/:ngoId', async (req, res) => {
  try {
    const { ngoId } = req.params;

    // Fetch tasks for the specified NGO ID
    const tasks = await Task.find({ ngoId });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching tasks.', error });
  }
});

module.exports = router;
