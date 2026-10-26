const router = require("express").Router();
const goalController = require("../controllers/goalController");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", authMiddleware, goalController.list);
router.get("/:id", authMiddleware, goalController.getOne);
router.post("/", authMiddleware, requireRole("admin"), goalController.create);
router.put("/:id", authMiddleware, requireRole("admin"), goalController.update);
router.delete("/:id", authMiddleware, requireRole("admin"), goalController.remove);
router.post("/:goalId/skills", authMiddleware, requireRole("admin"), goalController.addSkill);
router.delete("/:goalId/skills/:skillId", authMiddleware, requireRole("admin"), goalController.removeSkill);

module.exports = router;
