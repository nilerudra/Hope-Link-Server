const express = require("express");
const router = express.Router();
const Posts = require("../models/posts");

router.get('/', async(req, res) => {
    const posts = await Posts.find()
    res.json(posts);  // Send JSON data
  });

  module.exports = router;