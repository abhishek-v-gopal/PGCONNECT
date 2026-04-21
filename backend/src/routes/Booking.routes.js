const router = require("express").Router();
const { createBooking, getMyBookings, getOwnerBookings } = require("../controllers/admin.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

router.post("/",       protect, restrictTo("student"),        createBooking);
router.get("/mine",    protect, restrictTo("student"),        getMyBookings);
router.get("/owner",   protect, restrictTo("owner", "admin"), getOwnerBookings);

module.exports = router;