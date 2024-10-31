const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

postTitle: {
    type: String,
    required: true,
    trim: true
  },
  postImg: {
    type: String,
    required: true,
    trim: true
  },
  postTags: {
    type: String,
    required: true,
    trim: true
  }
});

const Post= mongoose.model("Post",postSchema);
module.exports=Post