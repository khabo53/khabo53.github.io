const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  type: { type: String, enum: ["blog", "vacancy"], required: true },
  category: String,
  location: String,
  image: String,
  applyUrl: String,
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);
