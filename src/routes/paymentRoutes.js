const express = require("express");
const router = express.Router();
const { createSubscription, verifyWebhook } = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/subscribe", protect, createSubscription);
// Webhook endpoint does not use protect middleware as Razorpay directly calls it
router.post("/webhook", verifyWebhook);

module.exports = router;
