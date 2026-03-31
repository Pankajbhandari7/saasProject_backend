const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  razorpaySubscriptionId: { type: String, required: true, unique: true },
  planId: { type: String, required: true },
  status: { type: String, required: true },
  currentEnd: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
