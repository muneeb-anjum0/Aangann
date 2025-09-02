import express from "express";
import admin from 'firebase-admin';

// Initialize Firebase
let db;
let firebaseError = null;
let isInitialized = false;

async function initializeFirebase() {
  if (isInitialized) return;
  
  try {
    console.log("🔥 Starting Firebase initialization...");
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found");
    }
    
    if (admin.apps.length === 0) {
      console.log("🔑 Decoding service account key...");
      const serviceAccountString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString();
      const serviceAccount = JSON.parse(serviceAccountString);
      
      console.log("� Initializing Firebase Admin SDK...");
      console.log("Project ID:", serviceAccount.project_id);
      console.log("Client Email:", serviceAccount.client_email);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      
      console.log("✅ Firebase Admin SDK initialized");
    }
    
    db = admin.firestore();
    
    // Set explicit project for Firestore
    process.env.GOOGLE_CLOUD_PROJECT = 'aangan-821e4';
    process.env.GCLOUD_PROJECT = 'aangan-821e4';
    
    console.log("✅ Firestore connection established");
    isInitialized = true;
    
  } catch (error) {
    firebaseError = error;
    console.error("❌ Firebase initialization error:", error);
    throw error;
  }
}

// Initialize Firebase immediately
await initializeFirebase();

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

// Firebase diagnostic endpoint
app.get("/api/firebase-status", (req, res) => {
  try {
    const status = {
      firebase: {
        initialized: admin.apps.length > 0,
        error: firebaseError?.message || null,
        projectId: admin.apps[0]?.options?.projectId || null,
        serviceAccountEmail: admin.apps[0]?.options?.credential?.projectId || null
      },
      environment: {
        hasFirebaseKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || null,
        nodeEnv: process.env.NODE_ENV || 'production'
      },
      database: {
        initialized: !!db,
        ready: false
      }
    };

    // Try a simple database operation without querying collections
    if (db) {
      try {
        // Just check if we can create a document reference (this doesn't hit the network)
        const testRef = db.collection('test').doc('test');
        status.database.ready = !!testRef;
      } catch (error) {
        status.database.error = error.message;
      }
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get Firebase status",
      details: error.message
    });
  }
});

// Test endpoints
app.get("/api/firebase-test", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }
    
    console.log("🧪 Testing basic Firebase connection...");
    
    // First, let's try to get project info (doesn't require Firestore permissions)
    const app = admin.app();
    const projectId = app.options.projectId;
    
    console.log("📱 Firebase app info:", {
      projectId,
      name: app.name
    });
    
    // Now try the simplest Firestore operation - get a non-existent document
    // This should work even with minimal permissions
    console.log("🔍 Testing Firestore access...");
    const testRef = db.collection('_test_connection_').doc('_test_doc_');
    const doc = await testRef.get();
    
    console.log("✅ Firestore access successful - document exists:", doc.exists);
    
    res.json({ 
      success: true,
      message: "Firebase connection working!",
      projectId,
      firestoreAccess: true,
      documentExists: doc.exists
    });
  } catch (error) {
    console.error("❌ Firebase test error:", error);
    
    // More detailed error info
    const errorInfo = {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details || "No additional details"
    };
    
    res.status(500).json({ 
      error: "Firebase test failed", 
      ...errorInfo,
      suggestion: error.code === 16 ? "Service account may not have Firestore permissions" : "Unknown Firebase error"
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

// Blog endpoints with REST API fallback
app.get("/api/blogs", async (req, res) => {
  try {
    console.log("📚 Blogs endpoint called");
    
    // Try Firebase Admin SDK first
    try {
      await initializeFirebase();
      
      if (db) {
        console.log("🔍 Trying Firebase Admin SDK...");
        const blogsRef = db.collection('blogs');
        const snapshot = await blogsRef.limit(10).get();
        
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
        
        console.log(`✅ Admin SDK success: ${blogs.length} blogs`);
        return res.json(blogs);
      }
    } catch (adminError) {
      console.warn("⚠️ Admin SDK failed, trying REST API:", adminError.message);
    }
    
    // Fallback to Firebase REST API
    console.log("🔄 Using Firebase REST API...");
    
    const serviceAccountString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString();
    const serviceAccount = JSON.parse(serviceAccountString);
    const projectId = serviceAccount.project_id;
    
    // Create access token manually
    const jwt = await import('jsonwebtoken');
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/datastore'
    };
    
    const token = jwt.sign(payload, serviceAccount.private_key, { algorithm: 'RS256' });
    
    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`
    });
    
    const tokenData = await tokenResponse.json();
    
    // Query Firestore REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/blogs?pageSize=10`;
    const firestoreResponse = await fetch(firestoreUrl, {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    
    const data = await firestoreResponse.json();
    
    // Transform Firestore REST response
    const blogs = (data.documents || []).map(doc => {
      const fields = doc.fields || {};
      const transformed = {};
      
      // Convert Firestore field format to regular object
      for (const [key, field] of Object.entries(fields)) {
        if (field.stringValue) transformed[key] = field.stringValue;
        else if (field.integerValue) transformed[key] = parseInt(field.integerValue);
        else if (field.timestampValue) transformed[key] = field.timestampValue;
        else if (field.arrayValue) transformed[key] = field.arrayValue.values || [];
      }
      
      const docId = doc.name.split('/').pop();
      return { id: docId, _id: docId, ...transformed };
    });
    
    console.log(`✅ REST API success: ${blogs.length} blogs`);
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
