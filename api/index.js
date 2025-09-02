// Vercel serverless function handler
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "../server/src/lib/db.js";
import authRoutes from "../server/src/routes/authRoutes.js";
import blogRoutes from "../server/src/routes/blogRoutes.js";
import importRoutes from "../server/src/routes/importRoutes.js";
import uploadRoutes from "../server/src/routes/uploadRoutes.js";
import testimonialRoutes from "../server/src/routes/testimonialRoutes.js";
import faqRoutes from "../server/src/routes/faqRoutes.js";
import contactRoutes from "../server/src/routes/contactRoutes.js";
import waitlistRoutes from "../server/src/routes/waitlistRoutes.js";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Allow your frontend domain
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'https://aangann-frontend.vercel.app',
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

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/import", importRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/waitlist", waitlistRoutes);

// Test endpoint
app.get("/api/test", (_req, res) => res.json({ message: "API is working", timestamp: new Date().toISOString() }));

// Connect to database
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) return;
  try {
    await connectDB();
    isConnected = true;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

export default async function handler(req, res) {
  await connectToDatabase();
  return app(req, res);
}
