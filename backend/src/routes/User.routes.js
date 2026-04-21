const router = require("express").Router();
const User = require("../models/user.model");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// GET /api/users/profile
router.get("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "savedProperties", "name location startingPrice images status"
    );
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

// PATCH /api/users/profile
router.patch("/profile", protect, upload.single("avatar"), async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "university"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f]) updates[f] = req.body[f]; });
    if (req.file) updates.avatar = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

// POST /api/users/save/:propertyId
router.post("/save/:propertyId", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const id = req.params.propertyId;
    const isSaved = user.savedProperties.map(String).includes(id);
    if (isSaved) {
      user.savedProperties = user.savedProperties.filter((p) => p.toString() !== id);
    } else {
      user.savedProperties.push(id);
    }
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, saved: !isSaved, message: isSaved ? "Removed from saved." : "Property saved." });
  } catch (err) { next(err); }
});

module.exports = router;