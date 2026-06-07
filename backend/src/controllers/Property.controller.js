// src/controllers/property.controller.js
const Property = require("../models/property.model");
const { validationResult } = require("express-validator");
const { deleteImages, getPublicUrl, getSignedImageUrl } = require("../config/r2.service");

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
    if (roomType) query["rooms.type"] = roomType;
    if (search)   query.$text = { $search: search };

    const sortMap = {
      price_asc:  { startingPrice: 1 },
      price_desc: { startingPrice: -1 },
      rating:     { rating: -1 },
      newest:     { createdAt: -1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };
    const skip   = (Number(page) - 1) * Number(limit);

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

    // ── CHANGED: if bucket is private, generate signed URLs on the fly ────────
    // If R2_PUBLIC_URL is set (public bucket), images[] already has URLs — skip this.
    if (!process.env.R2_PUBLIC_URL && property.imageKeys?.length) {
      const signed = await Promise.all(property.imageKeys.map(getSignedImageUrl));
      property.images = signed.filter(Boolean);
    }
    // ─────────────────────────────────────────────────────────────────────────

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

    // ── CHANGED: req.files now come from multer-s3, not local disk ────────────
    // file.key      → "properties/uuid.jpg"  — the R2 object key (save this)
    // file.location → public CDN URL          — present when bucket is public
    const files     = req.files ?? [];
    const imageKeys = files.map((f) => f.key);
    const images    = files.map((f) => f.location ?? getPublicUrl(f.key) ?? "").filter(Boolean);
    // ─────────────────────────────────────────────────────────────────────────

    const parsedRooms = typeof rooms === "string" ? JSON.parse(rooms || "[]") : rooms || [];

    const property = await Property.create({
      owner: req.user._id,
      name, tagline, location, amenities,
      rooms: parsedRooms,
      gender, manager,
      imageKeys,  // ← NEW field (R2 keys for delete/sign)
      images,     // ← public URLs or empty array
      startingPrice: 0,
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

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this property." });
    }

    const allowed = ["name", "tagline", "location", "amenities", "rooms", "gender", "manager"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = field === "rooms" && typeof req.body[field] === "string"
          ? JSON.parse(req.body[field])
          : req.body[field];
      }
    });

    // ── CHANGED: append new R2 images instead of local file paths ─────────────
    if (req.files?.length) {
      const files = req.files;
      property.imageKeys.push(...files.map((f) => f.key));
      property.images.push(
        ...files.map((f) => f.location ?? getPublicUrl(f.key) ?? "").filter(Boolean)
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    if (property.status === "verified") {
      property.status    = "pending";
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

    // ── CHANGED: delete all images from R2 before removing the document ───────
    await deleteImages(property.imageKeys ?? []);
    // ─────────────────────────────────────────────────────────────────────────

    await property.deleteOne();
    res.json({ success: true, message: "Property deleted." });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/properties/owner/mine ────────────────────────────────────────────
exports.getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: properties.length, properties });
  } catch (err) {
    next(err);
  }
};