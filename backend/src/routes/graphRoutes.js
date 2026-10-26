const router = require("express").Router();
const graphController = require("../controllers/graphController");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, graphController.getGraph);

module.exports = router;
