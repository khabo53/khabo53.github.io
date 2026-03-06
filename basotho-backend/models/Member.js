const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plan: { type: String, enum: ["free", "premium"], default: "free" },
  joinedAt: { type: Date, default: Date.now }
});

memberSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
// Hash password before saving
memberSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Member", memberSchema);
