const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  type:      { type: String, enum: ["Single", "Double", "Triple"], required: true },
  price:     { type: Number, required: true, min: 0 },
  totalBeds: { type: Number, required: true, min: 1 },
  availableBeds: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true },
});

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      maxlength: [120, "Name too long"],
    },
    tagline: { type: String, trim: true, maxlength: 200 },
    location: {
      address:   { type: String, required: true },
      city:      { type: String, required: true },
      landmark:  { type: String },
      mapLabel:  { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    images: [{ type: String }],
    amenities: [{ type: String }],
    rooms: [roomSchema],

    gender: {
      type: String,
      enum: ["Boys", "Girls", "Co-ed"],
      default: "Co-ed",
    },

    // Pricing — starting price (lowest room)
    startingPrice: { type: Number, required: true, min: 0 },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "in_review", "verified", "rejected", "unlisted"],
      default: "pending",
    },
    isVerified: { type: Boolean, default: false },
    verifiedAt:  { type: Date },
    verifiedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },

    manager: {
      name: { type: String },
      phone: { type: String },
    },

    totalBeds:     { type: Number, default: 0 },
    availableBeds: { type: Number, default: 0 },

    views:    { type: Number, default: 0 },
    inquiries:{ type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Auto-calculate totals before save ────────────────────────────────────────
propertySchema.pre("save", function (next) {
  if (this.rooms && this.rooms.length > 0) {
    this.totalBeds     = this.rooms.reduce((s, r) => s + r.totalBeds, 0);
    this.availableBeds = this.rooms.reduce((s, r) => s + r.availableBeds, 0);
    this.startingPrice = Math.min(...this.rooms.map((r) => r.price));
  }
  next();
});

// ── Text search index ─────────────────────────────────────────────────────────
propertySchema.index({ name: "text", "location.city": "text", "location.address": "text" });
propertySchema.index({ "location.city": 1, status: 1 });
propertySchema.index({ startingPrice: 1 });

module.exports = mongoose.model("Property", propertySchema);