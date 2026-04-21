const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// ── Protect: verify JWT ───────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Cookie (preferred)
    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // 2. Authorization header fallback
    else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated. Please sign in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User no longer exists or is disabled." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

// ── Restrict to specific roles ────────────────────────────────────────────────
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Requires role: ${roles.join(" or ")}.`,
    });
  }
  next();
};

// ── Optional auth (attach user if token present, don't fail) ─────────────────
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch (_) { /* silent */ }
  next();
};

module.exports = { protect, restrictTo, optionalAuth };