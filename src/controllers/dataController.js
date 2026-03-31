const mongoose = require("mongoose");
const AuditLog = require("../models/AuditLog");

const DataSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  title: String,
  value: Number,
  category: String,
  createdAt: { type: Date, default: Date.now }
});

const Data = mongoose.model("Data", DataSchema);

const createDataRecord = async (req, res, next) => {
  try {
    const { orgId, title, value, category } = req.body;
    const record = await Data.create({ organizationId: orgId, title, value, category });
    
    await AuditLog.create({
       organizationId: orgId,
       userId: req.user ? req.user._id : null,
       action: "DATA_CREATED",
       description: `Created data record ${title}`
    });

    if (req.app.get("io")) {
      req.app.get("io").emit("notification", `New data record added: ${title}`);
    }

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const categoryStats = await Data.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(orgId) } },
      { $group: { _id: "$category", totalValue: { $sum: "$value" }, count: { $sum: 1 } } }
    ]);

    const recentRecords = await Data.find({ organizationId: orgId }).sort({ createdAt: -1 }).limit(5);

    res.json({ categoryStats, recentRecords });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDataRecord, getAnalytics };
