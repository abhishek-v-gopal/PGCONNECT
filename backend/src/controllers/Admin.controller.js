const Property = require("../models/property.model");
const User = require("../models/user.model");
const { Booking, Inquiry } = require("../models/booking.model");

// ══════════════════════════════════════════════════════════
//  ADMIN CONTROLLER
// ══════════════════════════════════════════════════════════

// GET /api/admin/stats
exports.getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProperties, pendingVerifications, activeListings] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Property.countDocuments(),
      Property.countDocuments({ status: "pending" }),
      Property.countDocuments({ status: "verified" }),
    ]);

    const studentCount = await User.countDocuments({ role: "student", isActive: true });
    const ownerCount   = await User.countDocuments({ role: "owner",   isActive: true });

    res.json({
      success: true,
      stats: {
        totalUsers,
        studentCount,
        ownerCount,
        totalProperties,
        pendingVerifications,
        activeListings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/verification-queue
exports.getVerificationQueue = async (req, res, next) => {
  try {
    const { status = "pending", page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find({ status })
        .populate("owner", "name email phone")
        .sort({ createdAt: 1 }) // oldest first
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments({ status }),
    ]);

    res.json({ success: true, total, page: Number(page), properties });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/properties/:id/verify
exports.verifyProperty = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body; // action: "approve" | "reject" | "review"

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found." });

    if (action === "approve") {
      property.status      = "verified";
      property.isVerified  = true;
      property.verifiedAt  = new Date();
      property.verifiedBy  = req.user._id;
      property.rejectionReason = undefined;
    } else if (action === "reject") {
      property.status          = "rejected";
      property.isVerified      = false;
      property.rejectionReason = rejectionReason || "Does not meet platform standards.";
    } else if (action === "review") {
      property.status = "in_review";
    }

    await property.save();
    res.json({ success: true, message: `Property ${action}d.`, property });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role)   query.role = role;
    if (search) query.$or = [
      { name:  new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({ success: true, total, page: Number(page), users });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id/toggle
exports.toggleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}.`, user });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════
//  BOOKING CONTROLLER
// ══════════════════════════════════════════════════════════

// POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { propertyId, roomType, moveInDate, monthlyRent } = req.body;

    const property = await Property.findById(propertyId);
    if (!property || property.status !== "verified") {
      return res.status(404).json({ success: false, message: "Property not available." });
    }

    const booking = await Booking.create({
      tenant: req.user._id,
      property: propertyId,
      roomType, moveInDate, monthlyRent,
    });

    property.inquiries += 1;
    await property.save({ validateBeforeSave: false });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/mine
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ tenant: req.user._id })
      .populate("property", "name location images startingPrice")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/owner — owner sees bookings for their properties
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const myProperties = await Property.find({ owner: req.user._id }).select("_id");
    const ids = myProperties.map((p) => p._id);

    const bookings = await Booking.find({ property: { $in: ids } })
      .populate("tenant", "name email phone")
      .populate("property", "name location")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════
//  INQUIRY CONTROLLER
// ══════════════════════════════════════════════════════════

// POST /api/inquiries
exports.createInquiry = async (req, res, next) => {
  try {
    const { propertyId, name, phone, moveIn, message } = req.body;

    const inquiry = await Inquiry.create({
      property: propertyId,
      name, phone, moveIn, message,
      user: req.user?._id,
    });

    // bump counter
    await Property.findByIdAndUpdate(propertyId, { $inc: { inquiries: 1 } });

    res.status(201).json({ success: true, message: "Inquiry sent!", inquiry });
  } catch (err) {
    next(err);
  }
};

// GET /api/inquiries/owner — inquiries for the owner's properties
exports.getOwnerInquiries = async (req, res, next) => {
  try {
    const myProps = await Property.find({ owner: req.user._id }).select("_id");
    const inquiries = await Inquiry.find({ property: { $in: myProps.map((p) => p._id) } })
      .populate("property", "name location")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, inquiries });
  } catch (err) {
    next(err);
  }
};