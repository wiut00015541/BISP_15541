// lookupRoutes wires endpoint paths to the matching controllers.
const express = require("express");
const lookupsController = require("../controllers/lookupsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", lookupsController.getLookups);

module.exports = router;
