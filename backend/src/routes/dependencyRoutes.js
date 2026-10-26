const router = require("express").Router();
const dependencyController = require("../controllers/dependencyController");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", authMiddleware, requireRole("admin"), dependencyController.list);
router.post("/", authMiddleware, requireRole("admin"), dependencyController.create);
router.delete("/:id", authMiddleware, requireRole("admin"), dependencyController.remove);

module.exports = router;
