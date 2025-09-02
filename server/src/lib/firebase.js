// Firebase initialization
import admin from 'firebase-admin';
import { createRequire } from 'module';

let serviceAccount;

// For Vercel deployment, use environment variable
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Decode base64 service account key
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString()
  );
} else {
  // For local development, use JSON file
  const require = createRequire(import.meta.url);
  serviceAccount = require('../../firebaseServiceAccountKey.json');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'aangan-821e4.appspot.com'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

export { admin, db, bucket };
