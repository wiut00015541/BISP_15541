const express = require("express");
const applicationsController = require("../controllers/applicationsController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", requirePermission("applications.read"), applicationsController.getApplications);
router.post("/", requirePermission("applications.write"), applicationsController.createApplication);
router.patch("/:id/stage", requirePermission("applications.write"), applicationsController.updateStage);
router.post("/:id/interviews", requirePermission("applications.write"), applicationsController.scheduleInterview);
router.post("/interviews/:id/feedback", requirePermission("applications.write"), applicationsController.addInterviewFeedback);

module.exports = router;
