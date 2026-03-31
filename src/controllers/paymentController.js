const Razorpay = require("razorpay");
const crypto = require("crypto");
const Subscription = require("../models/Subscription");
const Organization = require("../models/Organization");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_xxxxxx",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "xxxxxxxxxxxxxxxx",
});

const createSubscription = async (req, res, next) => {
  try {
    const { planId, orgId } = req.body;
    
    // Convert generic plan structure to an order amount
    // Standard Orders API allows testing the payment popup immediately without needing pre-existing Razorpay dashboard Plan IDs.
    const amountInUSD = planId === "plan_Pro" ? 29 : 9;
    const amountInPaise = amountInUSD * 100 * 80;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const newSub = await Subscription.create({
      organizationId: orgId,
      razorpaySubscriptionId: order.id, // Linking to Order ID
      planId,
      status: "created",
    });

    res.json({ 
      orderId: order.id, 
      amount: order.amount, 
      sub: newSub,
      key: process.env.RAZORPAY_KEY_ID // Send key securely so frontend UI can render checkout without hardcoding
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500);
    next(new Error("Razorpay configuration failed. Have you added valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env?"));
  }
};

const verifyWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "default_secret";
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest === req.headers["x-razorpay-signature"]) {
      const event = req.body.event;
      if (event === "payment.captured" || event === "order.paid") {
        const orderId = req.body.payload.payment.entity.order_id;
        
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: orderId },
          { status: "active", currentEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        );
        const sub = await Subscription.findOne({ razorpaySubscriptionId: orderId });
        if(sub) {
          await Organization.findByIdAndUpdate(sub.organizationId, { subscriptionStatus: "ACTIVE" });
        }
      }
      res.json({ status: "ok" });
    } else {
      res.status(400).json({ status: "invalid signature" });
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    next(error);
  }
};

module.exports = { createSubscription, verifyWebhook };
