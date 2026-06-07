// src/config/r2.service.js
const { DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const r2 = require("./r2.config");

const BUCKET = process.env.R2_BUCKET_NAME;

/** Delete one object from R2. Safe to call with null. */
async function deleteImage(key) {
  if (!key) return;
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/** Delete multiple keys in parallel — used when deleting a property. */
async function deleteImages(keys = []) {
  await Promise.allSettled(keys.filter(Boolean).map(deleteImage));
}

/** Build a public CDN URL. Returns null if R2_PUBLIC_URL is not set. */
function getPublicUrl(key) {
  const base = process.env.R2_PUBLIC_URL;
  if (!base || !key) return null;
  return `${base.replace(/\/$/, "")}/${key}`;
}

/** Generate a temporary signed URL for a private bucket object (1 hr default). */
async function getSignedImageUrl(key, expiresIn = 3600) {
  if (!key) return null;
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}

module.exports = { deleteImage, deleteImages, getPublicUrl, getSignedImageUrl };