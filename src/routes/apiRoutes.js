const express = require("express");
const router = express.Router();
const { generateApiKey, getApiKeys } = require("../controllers/apiKeyController");
const { createDataRecord, getAnalytics } = require("../controllers/dataController");
const { protect } = require("../middlewares/authMiddleware");

// Shared application internal routes
router.post("/keys", protect, generateApiKey);
router.get("/keys/:orgId", protect, getApiKeys);

router.post("/data", protect, createDataRecord);
router.get("/analytics/:orgId", protect, getAnalytics);

module.exports = router;
