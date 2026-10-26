const router = require("express").Router();
const progressController = require("../controllers/progressController");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, progressController.list);
router.put("/:skillId", authMiddleware, progressController.update);

module.exports = router;
