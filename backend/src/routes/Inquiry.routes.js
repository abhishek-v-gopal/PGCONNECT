const router = require("express").Router();
const { createInquiry, getOwnerInquiries } = require("../controllers/admin.controller");
const { optionalAuth, protect, restrictTo } = require("../middleware/auth.middleware");

router.post("/",       optionalAuth,                           createInquiry);
router.get("/owner",   protect, restrictTo("owner", "admin"),  getOwnerInquiries);

module.exports = router;