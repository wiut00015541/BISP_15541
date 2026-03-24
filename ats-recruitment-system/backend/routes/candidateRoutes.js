const express = require("express");
const candidatesController = require("../controllers/candidatesController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");
const { uploadResume } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", requirePermission("candidates.read"), candidatesController.getCandidates);
router.get("/:id", requirePermission("candidates.read"), candidatesController.getCandidateById);
router.post("/", requirePermission("candidates.write"), uploadResume.single("resume"), candidatesController.createCandidate);
router.patch("/:id", requirePermission("candidates.write"), uploadResume.single("resume"), candidatesController.updateCandidate);
router.delete("/:id", requirePermission("candidates.write"), candidatesController.deleteCandidate);
router.post("/:id/notes", requirePermission("candidates.write"), candidatesController.addCandidateNote);
router.post("/:id/communications", requirePermission("candidates.write"), candidatesController.sendCommunication);

module.exports = router;
