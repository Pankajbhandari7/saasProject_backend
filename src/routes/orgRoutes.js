const express = require("express");
const router = express.Router();
const { createOrganization, getOrganizations, inviteUser } = require("../controllers/orgController");
const { protect } = require("../middlewares/authMiddleware");

router.route("/")
  .post(protect, createOrganization)
  .get(protect, getOrganizations);

const requireAdmin = async (req, res, next) => {
  const org = await require("../models/Organization").findById(req.params.id);
  if (!org) return res.status(404).json({message: "Not found"});
  const member = org.members.find(m => m.userId.toString() === req.user._id.toString());
  if (!member || member.role !== "ADMIN") return res.status(403).json({message: "Requires ADMIN role"});
  next();
};

router.post("/:id/invite", protect, requireAdmin, inviteUser);

module.exports = router;
