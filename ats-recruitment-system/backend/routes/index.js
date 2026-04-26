// index wires endpoint paths to the matching controllers.
const express = require("express");

const authRoutes = require("./authRoutes");
const jobRoutes = require("./jobRoutes");
const candidateRoutes = require("./candidateRoutes");
const applicationRoutes = require("./applicationRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const reportRoutes = require("./reportRoutes");
const aiRoutes = require("./aiRoutes");
const lookupRoutes = require("./lookupRoutes");
const departmentRoutes = require("./departmentRoutes");
const userRoutes = require("./userRoutes");
const optionRoutes = require("./optionRoutes");
const emailConfigRoutes = require("./emailConfigRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);
router.use("/candidates", candidateRoutes);
router.use("/applications", applicationRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/ai", aiRoutes);
router.use("/lookups", lookupRoutes);
router.use("/departments", departmentRoutes);
router.use("/users", userRoutes);
router.use("/options", optionRoutes);
router.use("/email", emailConfigRoutes);

module.exports = router;
