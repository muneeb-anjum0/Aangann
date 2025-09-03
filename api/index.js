import express from "express";
import admin from 'firebase-admin';

const app = express();

// Basic middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://aangann-frontend.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
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
    console.log("🔥 Starting Firebase initialization...");
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY");
    }
    
    if (admin.apps.length === 0) {
      const serviceAccountKey = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString();
      const serviceAccount = JSON.parse(serviceAccountKey);
      
      console.log("📝 Initializing with project:", serviceAccount.project_id);
      console.log("📧 Service account:", serviceAccount.client_email);
      
      // Set environment variables for Google Cloud
      process.env.GOOGLE_CLOUD_PROJECT = serviceAccount.project_id;
      process.env.GCLOUD_PROJECT = serviceAccount.project_id;
      process.env.FIRESTORE_EMULATOR_HOST = ''; // Make sure emulator is not used
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com/`
      });
      
      console.log("✅ Firebase Admin SDK initialized");
    }
    
    db = admin.firestore();
    
    // Explicitly set Firestore settings
    db.settings({
      projectId: 'aangan-821e4',
      preferRest: false, // Use gRPC for better performance
      ssl: true,
      host: 'firestore.googleapis.com',
      port: 443
    });
    
    firebaseInitialized = true;
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase init failed:", error.message);
    throw error;
  }
}

// Initialize Firebase immediately when the module loads
(async () => {
  try {
    await initFirebase();
  } catch (error) {
    console.error("Failed to initialize Firebase on startup:", error);
  }
})();

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

// Firebase diagnostic endpoint
app.get("/api/firebase-check", (req, res) => {
  try {
    const hasFirebaseKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    let keyInfo = null;
    
    if (hasFirebaseKey) {
      try {
        const serviceAccountKey = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString();
        const serviceAccount = JSON.parse(serviceAccountKey);
        keyInfo = {
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          hasPrivateKey: !!serviceAccount.private_key,
          privateKeyLength: serviceAccount.private_key ? serviceAccount.private_key.length : 0
        };
      } catch (parseError) {
        keyInfo = { error: "Failed to parse service account key", details: parseError.message };
      }
    }
    
    res.json({
      hasFirebaseKey,
      keyInfo,
      firebaseInitialized,
      adminAppsCount: admin.apps.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Firestore access directly
app.get("/api/firestore-test", async (req, res) => {
  try {
    console.log("🧪 Testing direct Firestore access...");
    
    await initFirebase();
    
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }
    
    console.log("📊 Database instance exists:", !!db);
    console.log("🔥 Admin apps count:", admin.apps.length);
    
    // Try to access a very simple document
    console.log("🔍 Attempting to access blogs collection...");
    const blogsRef = db.collection('blogs');
    
    // Try to get just one document
    console.log("📄 Getting single document...");
    const snapshot = await blogsRef.limit(1).get();
    
    console.log("✅ Query successful!");
    console.log("📊 Snapshot size:", snapshot.size);
    console.log("📊 Snapshot empty:", snapshot.empty);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      console.log("📄 Document ID:", doc.id);
      const data = doc.data();
      console.log("📄 Document keys:", Object.keys(data));
      
      res.json({
        success: true,
        message: "Firestore access working!",
        documentCount: snapshot.size,
        firstDocId: doc.id,
        firstDocKeys: Object.keys(data),
        sampleData: {
          id: doc.id,
          title: data.title || 'No title',
          excerpt: data.excerpt || 'No excerpt'
        }
      });
    } else {
      res.json({
        success: true,
        message: "Firestore access working but no documents found",
        documentCount: 0
      });
    }
    
  } catch (error) {
    console.error("❌ Firestore test failed:", error);
    res.status(500).json({
      error: "Firestore test failed",
      details: error.message,
      code: error.code,
      stack: error.stack
    });
  }
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

// Authentication endpoints for admin panel
app.get("/api/auth/me", async (req, res) => {
  try {
    // Check for token in cookies
    console.log("🍪 Checking auth - cookies:", req.headers.cookie);
    
    let token = null;
    if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') {
          token = value;
          break;
        }
      }
    }
    
    console.log("🔑 Token found:", !!token, token ? token.substring(0, 20) + '...' : 'none');
    
    if (!token) {
      return res.status(401).json({ 
        message: "No token provided",
        authenticated: false 
      });
    }
    
    // Parse and validate the token
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      console.log("📅 Token data:", { expiresAt: new Date(tokenData.expiresAt), now: new Date(), expired: Date.now() > tokenData.expiresAt });
      
      // Check if token has expired
      if (Date.now() > tokenData.expiresAt) {
        return res.status(401).json({ 
          message: "Session expired",
          authenticated: false 
        });
      }
      
      // Token is valid and not expired
      if (tokenData.user === 'admin-user') {
        console.log("✅ Valid session found");
        res.json({
          id: 'admin-user',
          email: 'admin@aangan-pk.com',
          role: 'admin'
        });
      } else {
        console.log("❌ Invalid user in token");
        res.status(401).json({ 
          message: "Invalid token",
          authenticated: false 
        });
      }
      
    } catch (parseError) {
      console.log("🚨 Token parse error:", parseError.message);
      return res.status(401).json({ 
        message: "Invalid token format",
        authenticated: false 
      });
    }
    
  } catch (error) {
    console.error("❌ Auth me error:", error);
    res.status(500).json({ 
      message: "Authentication failed", 
      details: error.message,
      authenticated: false
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt for:", email);
    
    // Simple hardcoded admin credentials
    if (email === 'admin@aangan-pk.com' && password === 'aangan@786!') {
      // Create a timestamped token that includes expiry time
      const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes from now
      const tokenData = {
        user: 'admin-user',
        expiresAt: expiresAt
      };
      const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
      
      console.log("🍪 Setting cookie with token:", token.substring(0, 20) + '...', "expires:", new Date(expiresAt));
      
      // Set cookie with proper expiration
      res.cookie('token', token, {
        httpOnly: true,
        secure: true, // Vercel uses HTTPS
        sameSite: 'none', // For cross-origin requests
        maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
        path: '/' // Ensure cookie is available for all paths
      });
      
      console.log("✅ Login successful, cookie set");
      res.json({
        id: 'admin-user',
        email: 'admin@aangan-pk.com',
        role: 'admin'
      });
    } else {
      console.log("❌ Invalid credentials");
      res.status(400).json({ message: "Invalid credentials" });
    }
    
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ 
      message: "Login failed", 
      details: error.message 
    });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    // Clear the cookie properly with all the same options as when it was set
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/'
    });
    
    // Also set an expired cookie as a fallback
    res.cookie('token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      expires: new Date(0) // Set to epoch (expired)
    });
    
    res.json({ ok: true, message: "Logged out successfully" });
    
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({ 
      message: "Logout failed", 
      details: error.message 
    });
  }
});

export default app;
