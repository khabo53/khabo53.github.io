const express = require("express");
const router = express.Router();
const Member = require("../models/Member");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const member = await Member.findById(decoded.id);
    if (!member) return res.status(400).json({ message: "Invalid token" });

    const salt = await bcrypt.genSalt(10);
    member.password = await bcrypt.hash(password, salt);
    await member.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
