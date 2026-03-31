const Organization = require("../models/Organization");
const User = require("../models/User");

const createOrganization = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const orgExists = await Organization.findOne({ slug });
    if (orgExists) {
      res.status(400);
      throw new Error("Organization with this slug already exists");
    }

    const org = await Organization.create({
      name,
      slug,
      ownerId: req.user._id,
      members: [{ userId: req.user._id, role: "ADMIN" }]
    });

    res.status(201).json(org);
  } catch (error) {
    next(error);
  }
};

const getOrganizations = async (req, res, next) => {
  try {
    const orgs = await Organization.find({ "members.userId": req.user._id });
    res.json(orgs);
  } catch (error) {
    next(error);
  }
};

const inviteUser = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const orgId = req.params.id;
    
    const org = await Organization.findById(orgId);
    if (!org) {
       res.status(404);
       throw new Error("Organization not found");
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      res.status(404);
      throw new Error("User with this email not found in system");
    }

    const isMember = org.members.find(m => m.userId.toString() === userToInvite._id.toString());
    if (isMember) {
      res.status(400);
      throw new Error("User already a member of this organization");
    }

    org.members.push({ userId: userToInvite._id, role: role || "MEMBER" });
    await org.save();

    res.json({ message: "User invited successfully", org });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrganization, getOrganizations, inviteUser };
