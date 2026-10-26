const router = require("express").Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/stats", authMiddleware, requireRole("admin"), adminController.stats);
router.get("/users", authMiddleware, requireRole("admin"), adminController.listUsers);

module.exports = router;
