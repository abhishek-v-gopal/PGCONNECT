const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    FirstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [80, "First name cannot exceed 80 characters"],
    },
    LastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [80, "Last name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned in queries
    },
    role: {
      type: String,
      enum: ["student", "owner", "admin"],
      default: "student",
    },
    phone: { type: String, trim: true },
    avatar: { type: String, default: "" },
    googleId: { type: String, default: "" },
    

    // Owner-specific
    isVerifiedOwner: { type: Boolean, default: false },
    isPremiumOwner:  { type: Boolean, default: false },

    // Student-specific
    university: { type: String, trim: true },

    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// ── Hash password before save ─────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Exclude sensitive fields in JSON output ───────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.googleId;
  return obj;
};

module.exports = mongoose.model("User", userSchema);