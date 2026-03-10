const express = require("express");
const jobsController = require("../controllers/jobsController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", requirePermission("jobs.read"), jobsController.getJobs);
router.post("/", requirePermission("jobs.write"), jobsController.createJob);
router.patch("/:id", requirePermission("jobs.write"), jobsController.updateJob);
router.delete("/:id", requirePermission("jobs.write"), jobsController.deleteJob);

module.exports = router;
