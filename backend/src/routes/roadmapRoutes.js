const router = require("express").Router();
const roadmapController = require("../controllers/roadmapController");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, roadmapController.getRoadmap);
router.post("/goal", authMiddleware, roadmapController.selectGoal);

module.exports = router;
