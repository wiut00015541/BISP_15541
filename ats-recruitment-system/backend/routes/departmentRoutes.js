const express = require("express");
const departmentsController = require("../controllers/departmentsController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", requirePermission("jobs.read"), departmentsController.getDepartments);
router.post("/", requirePermission("jobs.write"), departmentsController.createDepartment);
router.patch("/:id", requirePermission("jobs.write"), departmentsController.updateDepartment);
router.delete("/:id", requirePermission("jobs.write"), departmentsController.deleteDepartment);

module.exports = router;
