import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ 
    message: "Simple API is working!", 
    timestamp: new Date().toISOString()
  });
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "API endpoint working!", 
    timestamp: new Date().toISOString()
  });
});

app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Test endpoint working",
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
});

export default app;
