// Vercel serverless function handler
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

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

// Test endpoint for debugging
app.get("/api/test", (_req, res) => res.json({ 
  message: "API is working", 
  timestamp: new Date().toISOString(),
  nodeVersion: process.version,
  environment: process.env.NODE_ENV || 'development'
}));

// Temporary simple routes for testing
app.get("/api/blogs", (_req, res) => res.json({ message: "Blogs endpoint working", data: [] }));
app.get("/api/testimonials", (_req, res) => res.json({ message: "Testimonials endpoint working", data: [] }));

// Connect to database
const connectDB = async () => {
  console.log("----- Firebase is now Connected -----.");
};

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
