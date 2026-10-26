const router = require("express").Router();
const recommendationController = require("../controllers/recommendationController");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, recommendationController.getRecommendation);

module.exports = router;
