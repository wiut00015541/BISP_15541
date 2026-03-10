const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/overview", dashboardController.getOverview);

module.exports = router;
