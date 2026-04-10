const express = require("express");
const emailConfigController = require("../controllers/emailConfigController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/status", requirePermission("settings.write"), emailConfigController.getEmailStatus);
router.post("/test", requirePermission("settings.write"), emailConfigController.sendTestEmail);

module.exports = router;
