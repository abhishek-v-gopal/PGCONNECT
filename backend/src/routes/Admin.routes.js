const router = require("express").Router();
const {
  getPlatformStats, getVerificationQueue,
  verifyProperty, getAllUsers, toggleUser,
} = require("../controllers/admin.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

// All admin routes require admin role
router.use(protect, restrictTo("admin"));

router.get("/stats",                      getPlatformStats);
router.get("/verification-queue",         getVerificationQueue);
router.patch("/properties/:id/verify",    verifyProperty);
router.get("/users",                      getAllUsers);
router.patch("/users/:id/toggle",         toggleUser);

module.exports = router;