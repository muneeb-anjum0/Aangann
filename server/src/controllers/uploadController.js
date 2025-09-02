// Upload controller

import cloud from "../lib/cloudinary.js";

// Diagnostics for Cloudinary connectivity
export const pingCloudinary = async (_req, res) => {
  try {
  const info = await cloud.api.ping(); // Requires valid cloud_name + api key/secret
    return res.json({ ok: true, info });
  } catch (e) {
  // Log full error on the server
    console.error("Cloudinary ping failed:", e);

  // Return structured details to the client (no secrets)
    const cfg = cloud.config();
    return res.status(500).json({
      ok: false,
      name: e?.name || null,
      message: e?.message || null,
      http_code: e?.http_code || null,
      error: e?.error || null,
      response_body: e?.response?.body || null,
      cloudinary_config: {
  cloud_name: cfg?.cloud_name || null // Helps confirm .env is loading
      }
    });
  }
};

// Upload a single image (buffer in memory) using upload_stream
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });

    const result = await new Promise((resolve, reject) => {
      const stream = cloud.uploader.upload_stream(
        {
          folder: "aangan-blog-pro/images",
          resource_type: "image"
        },
        (err, uploaded) => {
          if (err) return reject(err);
          resolve(uploaded);
        }
      );
      stream.end(req.file.buffer);
    });

    return res.json({ url: result.secure_url });
  } catch (e) {
    console.error("Cloudinary upload failed:", e);
    return res.status(500).json({
      message: "Upload failed",
      name: e?.name || null,
      detail: e?.message || String(e),
      http_code: e?.http_code || null,
      error: e?.error || null,
      response_body: e?.response?.body || null
    });
  }
};
