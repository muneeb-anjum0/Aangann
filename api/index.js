import express from      console.log("🔑 Decoding service account key...");
      const serviceAccountString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString();
      console.log("🔑 Service account key decoded, length:", serviceAccountString.length);
      
      const serviceAccount = JSON.parse(serviceAccountString);
      console.log("🔑 Service account parsed successfully");
      
      console.log("🚀 Initializing Firebase Admin SDK...");
      console.log("Project ID:", serviceAccount.project_id);
      console.log("Client Email:", serviceAccount.client_email);
      console.log("Has private key:", !!serviceAccount.private_key);ss";
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

// Initialize Firebase immediately (wrapped in IIFE)
(async () => {
  try {
    await initializeFirebase();
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
})();

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

// Test endpoint to check raw Firestore response
app.get("/api/firestore-test", async (req, res) => {
  try {
    console.log("🔍 Testing Firestore REST API directly...");
    
    const serviceAccountString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString();
    const serviceAccount = JSON.parse(serviceAccountString);
    const projectId = serviceAccount.project_id;
    
    // Create access token manually
    const jwtModule = await import('jsonwebtoken');
    const jwt = jwtModule.default;
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
    console.log("Token response:", tokenData);
    
    // Query Firestore REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/blogs`;
    console.log("Querying URL:", firestoreUrl);
    
    const firestoreResponse = await fetch(firestoreUrl, {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    
    console.log("Firestore response status:", firestoreResponse.status);
    const rawData = await firestoreResponse.json();
    console.log("Raw Firestore response:", JSON.stringify(rawData, null, 2));
    
    res.json({
      success: true,
      projectId: projectId,
      firestoreStatus: firestoreResponse.status,
      documentCount: rawData.documents ? rawData.documents.length : 0,
      rawResponse: rawData
    });
    
  } catch (error) {
    console.error("❌ Firestore test error:", error);
    res.status(500).json({
      error: "Firestore test failed",
      details: error.message,
      stack: error.stack
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

// Test endpoint to verify environment variables
app.get("/api/test-env", async (req, res) => {
  try {
    console.log("🔑 Testing environment variables...");
    
    // Check if service account key exists
    const hasServiceAccountKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    console.log("Has service account key:", hasServiceAccountKey);
    
    if (hasServiceAccountKey) {
      try {
        const serviceAccountString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString();
        const serviceAccount = JSON.parse(serviceAccountString);
        
        console.log("Service account parsed successfully");
        console.log("Project ID:", serviceAccount.project_id);
        console.log("Client Email:", serviceAccount.client_email);
        console.log("Has private key:", !!serviceAccount.private_key);
        
        res.json({
          success: true,
          hasServiceAccountKey: true,
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          hasPrivateKey: !!serviceAccount.private_key,
          keyLength: serviceAccount.private_key ? serviceAccount.private_key.length : 0
        });
      } catch (parseError) {
        console.error("Failed to parse service account key:", parseError);
        res.status(500).json({
          error: "Failed to parse service account key",
          details: parseError.message,
          hasServiceAccountKey: true
        });
      }
    } else {
      res.status(500).json({
        error: "Service account key not found",
        hasServiceAccountKey: false
      });
    }
  } catch (error) {
    console.error("Environment test failed:", error);
    res.status(500).json({
      error: "Environment test failed",
      details: error.message
    });
  }
});

app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Test endpoint working",
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
});

// Test Firestore permissions specifically
app.get("/api/test-firestore", async (req, res) => {
  try {
    console.log("🧪 Testing Firestore permissions...");
    
    await initializeFirebase();
    
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }
    
    // Test 1: Check if we can get a collection reference
    console.log("Test 1: Getting collection reference...");
    const blogsRef = db.collection('blogs');
    console.log("✅ Collection reference created");
    
    // Test 2: Try to get collection metadata (doesn't require read permission)
    console.log("Test 2: Testing collection access...");
    try {
      const snapshot = await blogsRef.limit(1).get();
      console.log("✅ Collection query succeeded");
      console.log("Snapshot empty:", snapshot.empty);
      console.log("Snapshot size:", snapshot.size);
      
      if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0];
        console.log("First document ID:", firstDoc.id);
        console.log("First document data keys:", Object.keys(firstDoc.data()));
      }
      
      res.json({
        success: true,
        message: "Firestore access working",
        collectionAccess: true,
        documentCount: snapshot.size,
        isEmpty: snapshot.empty,
        firstDocId: snapshot.empty ? null : snapshot.docs[0].id
      });
      
    } catch (queryError) {
      console.error("❌ Collection query failed:", queryError);
      res.status(500).json({
        error: "Firestore query failed",
        details: queryError.message,
        code: queryError.code
      });
    }
    
  } catch (error) {
    console.error("❌ Firestore test failed:", error);
    res.status(500).json({
      error: "Firestore test failed",
      details: error.message,
      code: error.code
    });
  }
});

// Blog endpoints with detailed debugging
app.get("/api/blogs", async (req, res) => {
  try {
    console.log("📚 Blogs endpoint called");
    
    // Try Firebase Admin SDK first with detailed debugging
    try {
      await initializeFirebase();
      
      if (db) {
        console.log("🔍 Trying Firebase Admin SDK...");
        console.log("Database instance:", !!db);
        console.log("Admin apps length:", admin.apps.length);
        console.log("Project ID:", admin.apps[0]?.options?.projectId);
        
        const blogsRef = db.collection('blogs');
        console.log("Collection reference created");
        
        const snapshot = await blogsRef.limit(10).get();
        console.log("Query executed");
        console.log("Snapshot empty:", snapshot.empty);
        console.log("Snapshot size:", snapshot.size);
        
        const blogs = [];
        snapshot.forEach((doc, index) => {
          console.log(`Processing document ${index}: ${doc.id}`);
          const data = doc.data();
          console.log(`Document ${doc.id} data:`, Object.keys(data));
          blogs.push({
            id: doc.id,
            _id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
          });
        });
        
        console.log(`✅ Admin SDK success: ${blogs.length} blogs`);
        if (blogs.length > 0) {
          console.log("First blog:", blogs[0]);
        }
        return res.json(blogs);
      } else {
        console.log("❌ Database not initialized");
      }
    } catch (adminError) {
      console.warn("⚠️ Admin SDK failed, trying REST API:", adminError.message);
      console.error("Admin SDK error details:", adminError);
    }
    
    // Fallback to Firebase REST API
    console.log("🔄 Using Firebase REST API...");
    
    const serviceAccountString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString();
    const serviceAccount = JSON.parse(serviceAccountString);
    const projectId = serviceAccount.project_id;
    
    // Create access token manually
    const jwtModule = await import('jsonwebtoken');
    const jwt = jwtModule.default;
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
    console.log("📄 Raw Firestore response:", JSON.stringify(data, null, 2));
    
    const blogs = (data.documents || []).map(doc => {
      console.log("Processing document:", doc.name);
      const fields = doc.fields || {};
      const transformed = {};
      
      // Convert Firestore field format to regular object
      for (const [key, field] of Object.entries(fields)) {
        console.log(`Field ${key}:`, field);
        if (field.stringValue !== undefined) transformed[key] = field.stringValue;
        else if (field.integerValue !== undefined) transformed[key] = parseInt(field.integerValue);
        else if (field.doubleValue !== undefined) transformed[key] = parseFloat(field.doubleValue);
        else if (field.booleanValue !== undefined) transformed[key] = field.booleanValue;
        else if (field.timestampValue !== undefined) transformed[key] = field.timestampValue;
        else if (field.arrayValue !== undefined) {
          transformed[key] = (field.arrayValue.values || []).map(item => {
            if (item.stringValue) return item.stringValue;
            if (item.integerValue) return parseInt(item.integerValue);
            return item;
          });
        }
        else if (field.mapValue !== undefined) {
          const obj = {};
          for (const [subKey, subField] of Object.entries(field.mapValue.fields || {})) {
            if (subField.stringValue) obj[subKey] = subField.stringValue;
            else if (subField.integerValue) obj[subKey] = parseInt(subField.integerValue);
            else obj[subKey] = subField;
          }
          transformed[key] = obj;
        }
        else {
          console.log(`Unknown field type for ${key}:`, Object.keys(field));
          transformed[key] = field;
        }
      }
      
      const docId = doc.name.split('/').pop();
      console.log(`Transformed document ${docId}:`, transformed);
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
