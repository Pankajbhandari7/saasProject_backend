const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  razorpayCustomerId: { type: String },
  subscriptionStatus: { type: String, enum: ["ACTIVE", "INACTIVE", "PAST_DUE", "CANCELED"], default: "INACTIVE" },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Organization", organizationSchema);
