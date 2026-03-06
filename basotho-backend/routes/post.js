const express = require("express");
const Post = require("../models/post");
const router = express.Router();

// Get all posts
router.get("/", async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

// Create a post
router.post("/", async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
