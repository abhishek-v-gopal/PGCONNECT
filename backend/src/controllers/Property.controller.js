const Property = require("../models/property.model");
const User = require("../models/user.model");
const { validationResult } = require("express-validator");

// ── GET /api/properties — search & filter ─────────────────────────────────────
exports.getProperties = async (req, res, next) => {
  try {
    const {
      city, minPrice, maxPrice, gender, roomType,
      amenities, search, sort, page = 1, limit = 12,
    } = req.query;

    const query = { status: "verified" };

    if (city)    query["location.city"] = new RegExp(city, "i");
    if (gender)  query.gender = gender;
    if (minPrice || maxPrice) {
      query.startingPrice = {};
      if (minPrice) query.startingPrice.$gte = Number(minPrice);
      if (maxPrice) query.startingPrice.$lte = Number(maxPrice);
    }
    if (amenities) {
      const list = amenities.split(",").map((a) => a.trim());
      query.amenities = { $all: list };
    }
    if (roomType) {
      query["rooms.type"] = roomType;
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sortMap = {
      "price_asc":  { startingPrice: 1 },
      "price_desc": { startingPrice: -1 },
      "rating":     { rating: -1 },
      "newest":     { createdAt: -1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate("owner", "name phone")
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      properties,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/properties/:id ───────────────────────────────────────────────────
exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("owner", "name phone avatar")
      .populate("verifiedBy", "name");

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }

    // Increment view counter
    property.views += 1;
    await property.save({ validateBeforeSave: false });

    res.json({ success: true, property });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/properties — owner creates listing ──────────────────────────────
exports.createProperty = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, tagline, location, amenities, rooms, gender, manager } = req.body;

    // Attach uploaded image paths
    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : (req.body.images || []);

    // Handle rooms: it can come as a string (multipart form) or already-parsed object
    const parsedRooms = typeof rooms === 'string' ? JSON.parse(rooms || "[]") : (rooms || []);

    const property = await Property.create({
      owner: req.user._id,
      name, tagline, location, amenities, rooms: parsedRooms,
      gender, manager, images,
      startingPrice: 0, // pre-save hook recalculates
    });

    res.status(201).json({ success: true, message: "Property submitted for review.", property });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/properties/:id — owner updates own listing ────────────────────
exports.updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found." });

    // Only owner or admin
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this property." });
    }

    const allowed = ["name", "tagline", "location", "amenities", "rooms", "gender", "manager", "images"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Handle rooms: it can come as a string (multipart form) or already-parsed object
        if (field === "rooms" && typeof req.body[field] === 'string') {
          property[field] = JSON.parse(req.body[field]);
        } else {
          property[field] = req.body[field];
        }
      }
    });

    // New images
    if (req.files?.length) {
      property.images.push(...req.files.map((f) => `/uploads/${f.filename}`));
    }

    // Editing resets verification
    if (property.status === "verified") {
      property.status = "pending";
      property.isVerified = false;
    }

    await property.save();
    res.json({ success: true, property });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/properties/:id ────────────────────────────────────────────────
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found." });

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await property.deleteOne();
    res.json({ success: true, message: "Property deleted." });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/properties/owner/mine — owner's own listings ────────────────────
exports.getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: properties.length, properties });
  } catch (err) {
    next(err);
  }
};