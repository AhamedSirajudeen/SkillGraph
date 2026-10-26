const router = require("express").Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

router.put("/profile", authMiddleware, userController.updateProfile);

module.exports = router;
