const express = require("express");
const reportsController = require("../controllers/reportsController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/hiring-funnel", requirePermission("reports.read"), reportsController.getHiringFunnelReport);

module.exports = router;
