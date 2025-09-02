// Blog model helpers
import { db } from '../lib/firebase.js';
const BLOGS_COLLECTION = 'blogs';

// Create a new blog
async function createBlog(data) {
  const now = new Date();
  const blogData = {
    ...data,
    publishedAt: data.publishedAt || now,
    createdAt: now,
    updatedAt: now,
    likes: data.likes || 0,
    likedBy: data.likedBy || [],
  };
  const docRef = await db.collection(BLOGS_COLLECTION).add(blogData);
  return { id: docRef.id, ...blogData };
}


// Convert Firestore Timestamps to ISO strings
function convertTimestamps(obj) {
  const out = { ...obj };
  ["publishedAt", "createdAt", "updatedAt"].forEach((key) => {
    if (out[key] && typeof out[key] === "object") {
      if (typeof out[key].toDate === "function") {
        out[key] = out[key].toDate().toISOString();
      } else if (out[key].seconds !== undefined) {
        out[key] = new Date(out[key].seconds * 1000).toISOString();
      }
    }
  });
  return out;
}

// Get a blog by ID
async function getBlogById(id) {
  const doc = await db.collection(BLOGS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return convertTimestamps({ id: doc.id, ...doc.data() });
}

// Get all blogs (optionally with filters)
async function getAllBlogs() {
  const snapshot = await db.collection(BLOGS_COLLECTION).get();
  const blogs = (Array.isArray(snapshot.docs) ? snapshot.docs : []).map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
  blogs.sort((a, b) => {
    const getTime = (x) =>
      new Date(x.updatedAt || x.createdAt || x.publishedAt).getTime();
    return getTime(b) - getTime(a);
  });
  return blogs;
}


// Update a blog (content or any field, updates updatedAt)
async function updateBlog(id, data) {
  const now = new Date();
  await db.collection(BLOGS_COLLECTION).doc(id).update({ ...data, updatedAt: now });
  return getBlogById(id);
}

// Update only placement/isFeatured (does NOT update updatedAt)
async function updateBlogPlacement(id, data) {
  // Only allow placement, isFeatured, and monthlyOrder fields
  const allowed = {};
  if (typeof data.placement !== 'undefined') allowed.placement = data.placement;
  if (typeof data.isFeatured !== 'undefined') allowed.isFeatured = data.isFeatured;
  if (Array.isArray(data.monthlyOrder)) allowed.monthlyOrder = data.monthlyOrder;
  await db.collection(BLOGS_COLLECTION).doc(id).update(allowed);
  return getBlogById(id);
}

// Delete a blog
async function deleteBlog(id) {
  await db.collection(BLOGS_COLLECTION).doc(id).delete();
  return true;
}

export default {
  createBlog,
  getBlogById,
  getAllBlogs,
  updateBlog,
  updateBlogPlacement,
  deleteBlog,
};
