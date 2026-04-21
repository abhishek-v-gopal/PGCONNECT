const mongoose = require("mongoose");

// ── BOOKING ───────────────────────────────────────────────────────────────────
const bookingSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    roomType: { type: String, enum: ["Single", "Double", "Triple"], required: true },
    moveInDate: { type: Date, required: true },
    moveOutDate: { type: Date },
    monthlyRent: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "overdue", "processing"],
      default: "unpaid",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// ── INQUIRY ───────────────────────────────────────────────────────────────────
const inquirySchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    name:     { type: String, required: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    moveIn:   { type: Date },
    message:  { type: String, trim: true },
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional if logged in
    status:   { type: String, enum: ["new", "contacted", "closed"], default: "new" },
  },
  { timestamps: true }
);

module.exports = {
  Booking: mongoose.model("Booking", bookingSchema),
  Inquiry: mongoose.model("Inquiry", inquirySchema),
};