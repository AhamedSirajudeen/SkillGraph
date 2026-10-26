const router = require("express").Router();
const userSkillController = require("../controllers/userSkillController");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, userSkillController.list);
router.post("/", authMiddleware, userSkillController.add);
router.delete("/:skillId", authMiddleware, userSkillController.remove);

module.exports = router;
