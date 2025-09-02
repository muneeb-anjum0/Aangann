import express from "express";
import admin from 'firebase-admin';

const app = express();

// Basic middleware
app.use(express.json());

// CORS
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

// Initialize Firebase
let db = null;
let firebaseInitialized = false;

async function initFirebase() {
  if (firebaseInitialized) return;
  
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY");
    }
    
    if (admin.apps.length === 0) {
      const serviceAccountKey = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString();
      const serviceAccount = JSON.parse(serviceAccountKey);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
    }
    
    db = admin.firestore();
    firebaseInitialized = true;
    console.log("✅ Firebase initialized");
  } catch (error) {
    console.error("❌ Firebase init failed:", error.message);
    throw error;
  }
}

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Aangan API is working!", 
    timestamp: new Date().toISOString() 
  });
});

// API status
app.get("/api", (req, res) => {
  res.json({ 
    message: "API root working!", 
    firebase: firebaseInitialized,
    timestamp: new Date().toISOString() 
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Test endpoint working",
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Blogs endpoint
app.get("/api/blogs", async (req, res) => {
  try {
    console.log("📚 Fetching blogs...");
    
    await initFirebase();
    
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }
    
    const blogsRef = db.collection('blogs');
    const snapshot = await blogsRef.limit(10).get();
    
    console.log(`Found ${snapshot.size} blogs`);
    
    const blogs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      blogs.push({
        id: doc.id,
        _id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      });
    });
    
    console.log(`✅ Returning ${blogs.length} blogs`);
    res.json(blogs);
    
  } catch (error) {
    console.error("❌ Blogs error:", error);
    res.status(500).json({ 
      error: "Failed to fetch blogs", 
      details: error.message 
    });
  }
});

// Blog sections endpoint
app.get("/api/blogs/sections", async (req, res) => {
  try {
    await initFirebase();
    
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }
    
    const blogsRef = db.collection('blogs');
    const snapshot = await blogsRef.get();
    
    const allBlogs = [];
    snapshot.forEach(doc => {
      allBlogs.push({
        id: doc.id,
        _id: doc.id,
        ...doc.data()
      });
    });
    
    const featured = allBlogs.find(blog => blog.isFeatured) || allBlogs[0] || null;
    const monthlyTop = allBlogs
      .filter(blog => blog.placement === 'monthly')
      .sort((a, b) => (a.monthlyOrder || 0) - (b.monthlyOrder || 0))
      .slice(0, 3);
    
    res.json({
      featured,
      monthlyTop,
      total: allBlogs.length
    });
    
  } catch (error) {
    console.error("❌ Blog sections error:", error);
    res.status(500).json({ 
      error: "Failed to fetch blog sections", 
      details: error.message 
    });
  }
});

// Most liked blogs endpoint
app.get("/api/blogs/most-liked", async (req, res) => {
  try {
    await initFirebase();
    
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }
    
    const blogsRef = db.collection('blogs');
    const snapshot = await blogsRef.get();
    
    const blogs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      blogs.push({
        id: doc.id,
        _id: doc.id,
        ...data,
        likes: data.likes || 0
      });
    });
    
    const mostLiked = blogs
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 6);
    
    res.json(mostLiked);
    
  } catch (error) {
    console.error("❌ Most liked blogs error:", error);
    res.status(500).json({ 
      error: "Failed to fetch most liked blogs", 
      details: error.message 
    });
  }
});

// Testimonials endpoint
app.get("/api/testimonials", async (req, res) => {
  try {
    await initFirebase();
    
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }
    
    const testimonialsRef = db.collection('testimonials');
    const snapshot = await testimonialsRef.orderBy('createdAt', 'desc').get();
    
    const testimonials = [];
    snapshot.forEach(doc => {
      testimonials.push({
        id: doc.id,
        _id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(testimonials);
    
  } catch (error) {
    console.error("❌ Testimonials error:", error);
    res.status(500).json({ 
      error: "Failed to fetch testimonials", 
      details: error.message 
    });
  }
});

export default app;
