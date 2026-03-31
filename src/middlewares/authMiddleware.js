const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const ApiKey = require("../models/ApiKey");
const Organization = require("../models/Organization");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-passwordHash");
      return next();
    } catch (error) {
      res.status(401);
      return next(new Error("Not authorized, token failed"));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized, no token"));
  }
};

const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    if (!req.organization || !req.user) {
       res.status(403);
       return next(new Error("Missing organization context or user"));
    }
    const member = req.organization.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!member || !roles.includes(member.role)) {
       res.status(403);
       return next(new Error("Not authorized for this role in the organization"));
    }
    next();
  };
};

const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    res.status(401);
    return next(new Error("API Key missing"));
  }

  try {
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
    const validKey = await ApiKey.findOne({ keyHash });
    
    if (!validKey) {
      res.status(401);
      return next(new Error("Invalid API Key"));
    }

    req.organization = await Organization.findById(validKey.organizationId);
    next();
  } catch (error) {
    res.status(500);
    next(new Error("Internal error validating API key"));
  }
};

module.exports = { protect, authorizeRoles, validateApiKey };
