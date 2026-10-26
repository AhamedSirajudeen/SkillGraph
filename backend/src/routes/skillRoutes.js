const router = require("express").Router();
const skillController = require("../controllers/skillController");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", authMiddleware, skillController.list);
router.get("/admin/catalog", authMiddleware, requireRole("admin"), skillController.listCatalog);
router.get("/:id", authMiddleware, skillController.getOne);
router.post("/", authMiddleware, requireRole("admin"), skillController.create);
router.put("/:id", authMiddleware, requireRole("admin"), skillController.update);
router.delete("/:id", authMiddleware, requireRole("admin"), skillController.remove);

module.exports = router;
