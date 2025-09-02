// Server entry point
import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import importRoutes from "./routes/importRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import waitlistRoutes from "./routes/waitlistRoutes.js";
import { ensureSeed } from "./seed/seed.js";
import cloud from "./lib/cloudinary.js";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
// Allow Vite dev server and localhost for development
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  ...(process.env.CORS_ORIGINS ? (process.env.CORS_ORIGINS.split(',').map(s => s.trim())) : [])
];
app.use(cors({
  origin: (origin, cb) => {
  if (!origin) return cb(null, true); // Allow server-to-server or curl
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
}));

// Health check endpoint
app.get("/", (_req, res) => res.send("API OK"));
app.get("/api", (_req, res) => res.send("API OK"));
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/import", importRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/waitlist", waitlistRoutes);

const start = async () => {
  await connectDB();
  await ensureSeed();

  try {
    const ping = await cloud.api.ping();
    console.log("Cloudinary ping:", ping.status || ping.ok || "ok");
  } catch (e) {
    console.error("Cloudinary ping FAILED:", e?.message || e);
  }

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log("Server on", port));
};
start();
