const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authMiddleware, requirePermission("users.write"), authController.register);

module.exports = router;
