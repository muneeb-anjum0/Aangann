import express from "express";

const app = express();

// Basic middleware
app.use(express.json());

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoints
app.get("/", (req, res) => {
  res.json({ 
    message: "API is working!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "API root endpoint working!", 
    timestamp: new Date().toISOString()
  });
});

// Test endpoints
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Test endpoint working",
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
});

app.get("/api/blogs", (req, res) => {
  res.json({ 
    message: "Blogs endpoint working",
    data: [],
    timestamp: new Date().toISOString()
  });
});

app.get("/api/testimonials", (req, res) => {
  res.json({ 
    message: "Testimonials endpoint working",
    data: [],
    timestamp: new Date().toISOString()
  });
});

// Default export for Vercel
export default app;
