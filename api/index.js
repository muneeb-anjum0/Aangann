import express from "express";
import admin from 'firebase-admin';

// Initialize Firebase
let db;
let firebaseError = null;

try {
  console.log("🔥 Starting Firebase initialization...");
  console.log("Environment check:", {
    hasServiceKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    nodeEnv: process.env.NODE_ENV
  });
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && !admin.apps.length) {
    console.log("🔑 Decoding service account key...");
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString()
    );
    
    console.log("🚀 Initializing Firebase Admin SDK...");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'aangan-821e4.appspot.com'
    });
    
    console.log("✅ Firebase Admin SDK initialized");
  }
  
  db = admin.firestore();
  console.log("✅ Firestore connection established");
} catch (error) {
  firebaseError = error;
  console.error("❌ Firebase initialization error:", error);
  console.error("Error details:", error.message);
}

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
app.get("/api/firebase-test", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }
    
    console.log("🧪 Testing Firebase connection...");
    
    // Try to read from a simple collection first
    const testRef = db.collection('test');
    const testDoc = await testRef.add({ 
      test: true, 
      timestamp: new Date(),
      message: "Connection test from API"
    });
    
    console.log("✅ Test document created:", testDoc.id);
    
    // Now try to read it back
    const doc = await testRef.doc(testDoc.id).get();
    const data = doc.data();
    
    // Clean up - delete the test document
    await testRef.doc(testDoc.id).delete();
    
    res.json({ 
      success: true,
      message: "Firebase connection working!",
      testData: data,
      documentId: testDoc.id
    });
  } catch (error) {
    console.error("❌ Firebase test error:", error);
    res.status(500).json({ 
      error: "Firebase test failed", 
      details: error.message,
      code: error.code 
    });
  }
});

app.get("/api/debug", (req, res) => {
  res.json({ 
    message: "Debug endpoint",
    firebase: {
      initialized: !!db,
      error: firebaseError?.message || null,
      adminAppsLength: admin.apps.length
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasFirebaseKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    },
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

// Blog endpoints
app.get("/api/blogs", async (req, res) => {
  try {
    console.log("📚 Blogs endpoint called");
    
    if (!db) {
      console.error("❌ Database not initialized");
      return res.status(500).json({ 
        error: "Database not initialized",
        firebaseError: firebaseError?.message || "Unknown Firebase error"
      });
    }
    
    console.log("🔍 Checking collections...");
    
    // First, let's try to list collections to see what's available
    const collections = await db.listCollections();
    console.log("📁 Available collections:", collections.map(c => c.id));
    
    // Try to query blogs collection
    console.log("🔍 Querying blogs collection...");
    const blogsRef = db.collection('blogs');
    
    // Simple get without ordering first
    const snapshot = await blogsRef.limit(10).get();
    
    console.log(`📄 Found ${snapshot.size} blogs`);
    
    const blogs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📄 Blog: ${doc.id}`, Object.keys(data));
      blogs.push({
        id: doc.id,
        _id: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      });
    });
    
    console.log(`✅ Returning ${blogs.length} blogs`);
    res.json(blogs);
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    res.status(500).json({ 
      error: "Failed to fetch blogs", 
      details: error.message,
      code: error.code,
      stack: error.stack
    });
  }
});

app.get("/api/blogs/sections", async (req, res) => {
  try {
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
    
    // Find featured blog
    const featured = allBlogs.find(blog => blog.isFeatured) || allBlogs[0] || null;
    
    // Find monthly top blogs
    const monthlyTop = allBlogs
      .filter(blog => blog.placement === 'monthly')
      .sort((a, b) => (a.monthlyOrder || 0) - (b.monthlyOrder || 0))
      .slice(0, 3);
    
    res.json({
      featured,
      monthlyTop
    });
  } catch (error) {
    console.error("Error fetching blog sections:", error);
    res.status(500).json({ error: "Failed to fetch blog sections", details: error.message });
  }
});

app.get("/api/blogs/most-liked", async (req, res) => {
  try {
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
    
    // Sort by likes and get top 6
    const mostLiked = blogs
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 6);
    
    res.json(mostLiked);
  } catch (error) {
    console.error("Error fetching most liked blogs:", error);
    res.status(500).json({ error: "Failed to fetch most liked blogs", details: error.message });
  }
});

app.get("/api/testimonials", async (req, res) => {
  try {
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
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ error: "Failed to fetch testimonials", details: error.message });
  }
});

// Default export for Vercel
export default app;
