const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  postTitle: {
    type: String,
    required: true,
    trim: true,
  },
  postImg: {
    type: String,
    required: true,
    trim: true,
  },
  postTags: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now // Default to the current time when the document is created
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users" || "ngo",
    required: true,
  },
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
