// src/middleware/upload.middleware.js
// ─── Replaces your previous local-disk multer config ─────────────────────────
// Everything else in your codebase (routes, controllers) stays the same.
// req.files[] shape is identical — controllers access req.files as before.

const multer    = require("multer");
const multerS3  = require("multer-s3");
const path      = require("path");
const crypto    = require("crypto");
const r2        = require("../config/r2.config");

const BUCKET       = process.env.R2_BUCKET_NAME;
const ALLOWED      = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB  = 5;

const storage = multerS3({
  s3: r2,
  bucket: BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uid = crypto.randomUUID();
    // Stored as: properties/uuid.jpg
    cb(null, `properties/${uid}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  ALLOWED.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error(`Invalid file type. Allowed: ${ALLOWED.join(", ")}`));
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;