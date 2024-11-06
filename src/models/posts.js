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
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users" || "ngodetils",
    required: true,
  },
});

const Post= mongoose.model("Post",postSchema);
module.exports=Post