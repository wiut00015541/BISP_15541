const express = require("express");
const candidatesController = require("../controllers/candidatesController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", requirePermission("candidates.read"), candidatesController.getCandidates);
router.post("/", requirePermission("candidates.write"), candidatesController.createCandidate);
router.post("/:id/notes", requirePermission("candidates.write"), candidatesController.addCandidateNote);

module.exports = router;
