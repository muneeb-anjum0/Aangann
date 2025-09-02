// User model helpers
import { db } from '../lib/firebase.js';
const USERS_COLLECTION = 'users';

// Create a new user
async function createUser(data) {
  const now = new Date();
  const userData = {
    ...data,
    createdAt: now,
    updatedAt: now,
    role: data.role || 'admin',
  };
  const docRef = await db.collection(USERS_COLLECTION).add(userData);
  return { id: docRef.id, ...userData };
}

// Get a user by ID
async function getUserById(id) {
  const doc = await db.collection(USERS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

// Get a user by email
async function getUserByEmail(email) {
  const snapshot = await db.collection(USERS_COLLECTION).where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

// Update a user
async function updateUser(id, data) {
  const now = new Date();
  await db.collection(USERS_COLLECTION).doc(id).update({ ...data, updatedAt: now });
  return getUserById(id);
}

// Delete a user
async function deleteUser(id) {
  await db.collection(USERS_COLLECTION).doc(id).delete();
  return true;
}

export default {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
};
