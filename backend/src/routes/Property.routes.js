// ══════════════════════════════════════════════════════════
//  property.routes.js
// ══════════════════════════════════════════════════════════
const propRouter = require("express").Router();
const ctrl = require("../controllers/property.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

propRouter.get("/",                   ctrl.getProperties);
propRouter.get("/owner/mine", protect, restrictTo("owner", "admin"), ctrl.getMyProperties);
propRouter.get("/:id",                ctrl.getPropertyById);
propRouter.post("/",   protect, restrictTo("owner", "admin"), upload.array("images", 10), ctrl.createProperty);
propRouter.patch("/:id", protect, restrictTo("owner", "admin"), upload.array("images", 10), ctrl.updateProperty);
propRouter.delete("/:id", protect, restrictTo("owner", "admin"), ctrl.deleteProperty);

module.exports = propRouter;


