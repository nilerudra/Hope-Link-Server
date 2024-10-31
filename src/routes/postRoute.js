const express = require('express');
const Posts=require("../models/posts")
const router = express.Router();



router.post('/', async (req, res) => {
    try {
      const data={
     postTitle,
      postImg,
      postTags
        
      } = req.body;
      console.log(data)
  
      // Create a new NGO instance
      const newPost = new Posts({
        postTitle,
        postImg,
        postTags
      });
  
      
      const savePost = await newPost.save();
  
      res.status(201).json({ message: 'NGO registered successfully!', post: savePost });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while registering the NGO.', error });
    }
  });

  module.exports = router;