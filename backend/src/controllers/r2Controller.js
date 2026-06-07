// src/controllers/r2Controller.js
const { DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const r2 = require("../config/r2");

const BUCKET = process.env.R2_BUCKET_NAME;

/**
 * Delete a single object from R2 by its key.
 * Safe to call with null/undefined — it will simply return.
 */
async function deleteImage(key) {
  if (!key) return;
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/**
 * Generate a signed GET URL for a private object (expires in 1 hr by default).
 * Only needed when R2_PUBLIC_URL is NOT set.
 */
async function getSignedImageUrl(key, expiresIn = 3600) {
  if (!key) return null;
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Generate signed GET URLs for an array of keys.
 * Returns results in the same order as the input array.
 */
async function getSignedImageUrls(keys = [], expiresIn = 3600) {
  return Promise.all(keys.map((k) => getSignedImageUrl(k, expiresIn)));
}

/**
 * Build a public URL for an object key.
 * Returns null if R2_PUBLIC_URL is not set in .env.
 */
function getPublicUrl(key) {
  const base = process.env.R2_PUBLIC_URL;
  if (!base || !key) return null;
  return `${base.replace(/\/$/, "")}/${key}`;
}

module.exports = { deleteImage, getSignedImageUrl, getSignedImageUrls, getPublicUrl };