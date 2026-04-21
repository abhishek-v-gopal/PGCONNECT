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


// // ══════════════════════════════════════════════════════════
// //  user.routes.js  (profile management)
// // ══════════════════════════════════════════════════════════
// const userRouter = require("express").Router();
// const User = require("../models/user.model");
// const { protect: prot } = require("../middleware/auth.middleware");
// const uploadM = require("../middleware/upload.middleware");

// // GET profile
// userRouter.get("/profile", prot, async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user._id).populate("savedProperties", "name location startingPrice images status");
//     res.json({ success: true, user });
//   } catch (e) { next(e); }
// });

// // PATCH update profile
// userRouter.patch("/profile", prot, uploadM.single("avatar"), async (req, res, next) => {
//   try {
//     const allowed = ["name", "phone", "university"];
//     const updates = {};
//     allowed.forEach((f) => { if (req.body[f]) updates[f] = req.body[f]; });
//     if (req.file) updates.avatar = `/uploads/${req.file.filename}`;
//     const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
//     res.json({ success: true, user });
//   } catch (e) { next(e); }
// });

// // POST save / unsave property
// userRouter.post("/save/:propertyId", prot, async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const id = req.params.propertyId;
//     const isSaved = user.savedProperties.includes(id);
//     if (isSaved) {
//       user.savedProperties = user.savedProperties.filter((p) => p.toString() !== id);
//     } else {
//       user.savedProperties.push(id);
//     }
//     await user.save({ validateBeforeSave: false });
//     res.json({ success: true, saved: !isSaved, message: isSaved ? "Removed from saved." : "Property saved." });
//   } catch (e) { next(e); }
// });

// module.exports = userRouter;


// // ══════════════════════════════════════════════════════════
// //  booking.routes.js
// // ══════════════════════════════════════════════════════════
// const bookingRouter = require("express").Router();
// const bCtrl = require("../controllers/admin.controller");
// const { protect: bp, restrictTo: br } = require("../middleware/auth.middleware");

// bookingRouter.post("/",         bp, br("student"), bCtrl.createBooking);
// bookingRouter.get("/mine",      bp, br("student"), bCtrl.getMyBookings);
// bookingRouter.get("/owner",     bp, br("owner"),   bCtrl.getOwnerBookings);

// module.exports = bookingRouter;


// // ══════════════════════════════════════════════════════════
// //  admin.routes.js
// // ══════════════════════════════════════════════════════════
// const adminRouter = require("express").Router();
// const aC = require("../controllers/admin.controller");
// const { protect: ap, restrictTo: ar } = require("../middleware/auth.middleware");

// adminRouter.use(ap, ar("admin")); // all admin routes require admin role

// adminRouter.get("/stats",                        aC.getPlatformStats);
// adminRouter.get("/verification-queue",           aC.getVerificationQueue);
// adminRouter.patch("/properties/:id/verify",      aC.verifyProperty);
// adminRouter.get("/users",                        aC.getAllUsers);
// adminRouter.patch("/users/:id/toggle",           aC.toggleUser);

// module.exports = adminRouter;


// // ══════════════════════════════════════════════════════════
// //  inquiry.routes.js
// // ══════════════════════════════════════════════════════════
// const inquiryRouter = require("express").Router();
// const iC = require("../controllers/admin.controller");
// const { optionalAuth, protect: ip, restrictTo: ir } = require("../middleware/auth.middleware");

// inquiryRouter.post("/",         optionalAuth, iC.createInquiry);
// inquiryRouter.get("/owner",     ip, ir("owner", "admin"), iC.getOwnerInquiries);

// module.exports = inquiryRouter;