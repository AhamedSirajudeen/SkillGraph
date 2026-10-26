const router = require("express").Router();

router.use("/auth", require("./authRoutes"));
router.use("/skills", require("./skillRoutes"));
router.use("/goals", require("./goalRoutes"));
router.use("/user-skills", require("./userSkillRoutes"));
router.use("/progress", require("./progressRoutes"));
router.use("/roadmap", require("./roadmapRoutes"));
router.use("/graph", require("./graphRoutes"));
router.use("/dependencies", require("./dependencyRoutes"));
router.use("/recommendations", require("./recommendationRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/admin", require("./adminRoutes"));

module.exports = router;
