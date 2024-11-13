const express = require("express");
const router = express.Router();
const Posts = require("../models/posts");

// Route to get all posts sorted by latest first
router.get('/', async (req, res) => {
  try {
    const posts = await Posts.find().sort({ createdAt: -1 }); // Sort by createdAt in descending order
    
    // Check if posts are found
    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }

    res.json(posts);  // Send JSON data
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
