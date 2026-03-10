const express = require("express");
const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/resume-analysis", requirePermission("candidates.write"), aiController.analyzeResume);

module.exports = router;
