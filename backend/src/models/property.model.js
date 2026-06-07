// src/models/property.model.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  type:          { type: String, enum: ["Single", "Double", "Triple"], required: true },
  price:         { type: Number, required: true, min: 0 },
  totalBeds:     { type: Number, required: true, min: 1 },
  availableBeds: { type: Number, required: true, min: 0 },
  description:   { type: String, trim: true },
  // Room image stored in R2
  imageKey: { type: String, default: null }, // "rooms/uuid.jpg"  — R2 object key
  imageUrl: { type: String, default: null }, // public URL or null (private bucket)
});

const propertySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: {
      type: String, required: [true, "Property name is required"],
      trim: true, maxlength: [120, "Name too long"],
    },
    tagline:  { type: String, trim: true, maxlength: 200 },
    location: {
      address:  { type: String, required: true },
      city:     { type: String, required: true },
      landmark: { type: String },
      mapLabel: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    // ── Images ────────────────────────────────────────────────────────────────
    // imageKeys → R2 object keys (source of truth — used for delete & signed URLs)
    // images    → public CDN URLs served to clients
    //             • Public bucket:  both arrays populated at upload time
    //             • Private bucket: images[] empty; signed URLs generated on GET
    imageKeys: [{ type: String }], // ["properties/uuid1.jpg", ...]
    images:    [{ type: String }], // ["https://pub-xxx.r2.dev/properties/uuid1.jpg", ...]
    // ─────────────────────────────────────────────────────────────────────────

    amenities: [{ type: String }],
    rooms:     [roomSchema],

    gender: { type: String, enum: ["Boys", "Girls", "Co-ed"], default: "Co-ed" },

    startingPrice: { type: Number, required: true, min: 0 },
    rating:        { type: Number, default: 0, min: 0, max: 5 },
    totalRatings:  { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "in_review", "verified", "rejected", "unlisted"],
      default: "pending",
    },
    isVerified:      { type: Boolean, default: false },
    verifiedAt:      { type: Date },
    verifiedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },

    manager: { name: { type: String }, phone: { type: String } },

    totalBeds:     { type: Number, default: 0 },
    availableBeds: { type: Number, default: 0 },
    views:         { type: Number, default: 0 },
    inquiries:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Auto-calculate totals before save ─────────────────────────────────────────
propertySchema.pre("save", function (next) {
  if (this.rooms?.length > 0) {
    this.totalBeds     = this.rooms.reduce((s, r) => s + r.totalBeds, 0);
    this.availableBeds = this.rooms.reduce((s, r) => s + r.availableBeds, 0);
    this.startingPrice = Math.min(...this.rooms.map((r) => r.price));
  }
  next();
});

// ── Indexes ───────────────────────────────────────────────────────────────────
propertySchema.index({ name: "text", "location.city": "text", "location.address": "text" });
propertySchema.index({ "location.city": 1, status: 1 });
propertySchema.index({ startingPrice: 1 });

module.exports = mongoose.model("Property", propertySchema);