const express = require("express");

const authRoutes = require("./authRoutes");
const jobRoutes = require("./jobRoutes");
const candidateRoutes = require("./candidateRoutes");
const applicationRoutes = require("./applicationRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const reportRoutes = require("./reportRoutes");
const aiRoutes = require("./aiRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);
router.use("/candidates", candidateRoutes);
router.use("/applications", applicationRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/ai", aiRoutes);

module.exports = router;
