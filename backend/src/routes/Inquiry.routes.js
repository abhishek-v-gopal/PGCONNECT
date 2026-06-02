const router = require("express").Router();
const { createInquiry, getOwnerInquiries,updateInquiry } = require("../controllers/admin.controller");
const { optionalAuth, protect, restrictTo } = require("../middleware/auth.middleware");

router.post("/",       optionalAuth,                           createInquiry);
router.get("/owner",   protect, restrictTo("owner", "admin"),  getOwnerInquiries);
router.patch("/:id",   protect, restrictTo("owner", "admin"),  updateInquiry);

module.exports = router;