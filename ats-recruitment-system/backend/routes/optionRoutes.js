// optionRoutes wires endpoint paths to the matching controllers.
const express = require("express");
const optionsController = require("../controllers/optionsController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/:type", requirePermission("settings.write"), optionsController.getOptions);
router.post("/:type", requirePermission("settings.write"), optionsController.createOption);
router.patch("/:type/:id", requirePermission("settings.write"), optionsController.updateOption);
router.delete("/:type/:id", requirePermission("settings.write"), optionsController.deleteOption);

module.exports = router;
