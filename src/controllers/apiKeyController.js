const crypto = require("crypto");
const ApiKey = require("../models/ApiKey");
const AuditLog = require("../models/AuditLog");

const generateApiKey = async (req, res, next) => {
  try {
    const { orgId, name } = req.body;
    
    const key = crypto.randomBytes(32).toString("hex");
    const keyHash = crypto.createHash("sha256").update(key).digest("hex");
    
    await ApiKey.create({ organizationId: orgId, name, keyHash });

    await AuditLog.create({
       organizationId: orgId,
       userId: req.user._id,
       action: "API_KEY_GENERATED",
       description: `API Key ${name} was generated.`
    });

    res.status(201).json({ name, apiKey: key });
  } catch (error) {
    next(error);
  }
};

const getApiKeys = async (req, res, next) => {
  try {
    const orgId = req.params.orgId;
    const keys = await ApiKey.find({ organizationId: orgId }).select("name createdAt organizationId");
    res.json(keys);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateApiKey, getApiKeys };
