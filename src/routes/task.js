const express = require('express');
const Task = require('../models/assign-task');
const router = express.Router();

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

    res.status(201).json({ message: 'Task created successfully!', task: savedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the task.', error });
  }
});

module.exports = router;