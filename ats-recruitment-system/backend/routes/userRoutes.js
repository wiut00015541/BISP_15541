// userRoutes wires endpoint paths to the matching controllers.
const express = require("express");
const usersController = require("../controllers/usersController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/me", usersController.getCurrentUser);
router.patch("/me", usersController.updateCurrentUser);
router.get("/", requirePermission("users.read"), usersController.getUsers);
router.post("/", requirePermission("users.write"), usersController.createUser);
router.patch("/:id", requirePermission("users.write"), usersController.updateUser);
router.patch("/:id/status", requirePermission("users.write"), usersController.toggleUserStatus);
router.delete("/:id", requirePermission("users.write"), usersController.deleteUser);

module.exports = router;
