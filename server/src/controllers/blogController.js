// Get top 6 blogs by likes
export const mostLiked = async (_req, res) => {
  try {
    const blogs = await Blog.getAllBlogs();
    const sorted = [...blogs]
      .filter(b => typeof b.likes === 'number')
      .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
      .slice(0, 6);
    res.json(sorted);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch most liked blogs' });
  }
};
// Update only placement/isFeatured (does NOT update updatedAt)
export const updateBlogPlacement = async (req, res) => {
  const id = req.params.id;
  const { placement, isFeatured, monthlyOrder } = req.body;
  // Only allow placement, isFeatured, and monthlyOrder
  if (typeof placement === 'undefined' && typeof isFeatured === 'undefined' && typeof monthlyOrder === 'undefined') {
    return res.status(400).json({ message: 'No placement, isFeatured, or monthlyOrder provided' });
  }
  const valid = ["none", "top", "monthly", "latest"];
  let place = undefined;
  if (typeof placement !== 'undefined') {
    place = valid.includes(placement) ? placement : "latest";
  }
  // If monthlyOrder is provided, store it
  const updateObj = {
    ...(typeof place !== 'undefined' ? { placement: place } : {}),
    ...(typeof isFeatured !== 'undefined' ? { isFeatured: !!isFeatured } : {}),
    ...(Array.isArray(monthlyOrder) ? { monthlyOrder } : {})
  };
  const doc = await Blog.updateBlogPlacement(id, updateObj);
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
};
import slugify from "slugify";
import Blog from "../models/Blog.js";

const makeExcerpt = (html) => {
  const text = String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.slice(0, 180);
};

export const listAll = async (_req, res) => {
  const items = await Blog.getAllBlogs();
  res.json(items);
};

export const getBySlug = async (req, res) => {
  const blogs = await Blog.getAllBlogs();
  const b = blogs.find(blog => blog.slug === req.params.slug);
  if (!b) return res.status(404).json({ message: "Not found" });
  res.json(b);
};

export const getById = async (req, res) => {
  const b = await Blog.getBlogById(req.params.id);
  if (!b) return res.status(404).json({ message: "Not found" });
  res.json(b);
};

export const sections = async (_req, res) => {
  const blogs = await Blog.getAllBlogs();
  const featured = blogs.find(b => b.isFeatured);
  const top = (Array.isArray(blogs) ? blogs : []).filter(b => b.placement === "top").slice(0, 10);
  let monthly = (Array.isArray(blogs) ? blogs : []).filter(b => b.placement === "monthly");
  // Try to get custom order from first monthly blog
  let monthlyOrder = null;
  if (monthly.length > 0 && Array.isArray(monthly[0].monthlyOrder)) {
    monthlyOrder = monthly[0].monthlyOrder;
  }
  if (monthlyOrder && Array.isArray(monthlyOrder) && monthlyOrder.length > 0) {
  // Order monthly blogs by monthlyOrder array
    monthly = monthlyOrder
      .map(id => monthly.find(b => b.id === id))
      .filter(Boolean)
      .concat(monthly.filter(b => !monthlyOrder.includes(b.id)));
  }
  monthly = monthly.slice(0, 5);
  // Sort latest by publishedAt (descending)
  const latest = [...blogs]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);
  res.json({ featured, top, monthlyTop: monthly, latest });
};

export const createBlog = async (req, res) => {
  const {
    title, slug, html, minutesRead, categories,
    placement, isFeatured, thumbnailUrl, publishedAt
  } = req.body;

  if (!title || !String(title).trim()) return res.status(400).json({ message: "Title is required" });
  if (!html || !String(html).trim())   return res.status(400).json({ message: "Content (html) is required" });
  if (!thumbnailUrl)                   return res.status(400).json({ message: "Thumbnail image is missing" });

  const valid = ["none", "top", "monthly", "latest"];
  const place = valid.includes(placement) ? placement : "latest";

  const doc = await Blog.createBlog({
    title: String(title).trim(),
    slug: (slug?.trim()) || slugify(title, { lower: true, strict: true }),
    html,
    excerpt: makeExcerpt(html),
    minutesRead: minutesRead || 5,
  categories: (Array.isArray(categories) ? categories : []).map(s => String(s).trim()).filter(Boolean),
    placement: place,
    isFeatured: !!isFeatured,
    thumbnailUrl,
    publishedAt: publishedAt ? new Date(publishedAt) : new Date()
  });
  res.json(doc);
};

export const updateBlog = async (req, res) => {
  const id = req.params.id;
  const {
    title, slug, html, minutesRead, categories,
    placement, isFeatured, thumbnailUrl, publishedAt
  } = req.body;

  const valid = ["none", "top", "monthly", "latest"];
  const place = valid.includes(placement) ? placement : "latest";

  if (thumbnailUrl === "") {
    return res.status(400).json({ message: "Thumbnail image is missing" });
  }

  const update = {
    ...(title != null ? { title: String(title).trim() } : {}),
    ...(slug != null && String(slug).trim() ? { slug: String(slug).trim() } : {}),
    ...(html != null ? { html, excerpt: makeExcerpt(html) } : {}),
    ...(minutesRead != null ? { minutesRead } : {}),
  ...(Array.isArray(categories) ? { categories: categories.map(s => String(s).trim()).filter(Boolean) } : {}),
    placement: place,
    isFeatured: !!isFeatured,
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {})
  };

  const doc = await Blog.updateBlog(id, update);
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
};

export const removeBlog = async (req, res) => {
  await Blog.deleteBlog(req.params.id);
  res.json({ ok: true });
};

// Likes: like & unlike

// Increment likes by 1
export const likeBlog = async (req, res) => {
  try {
    const deviceId = req.body.deviceId;
    if (!deviceId) return res.status(400).json({ message: "Missing deviceId" });
    const blog = await Blog.getBlogById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });
    const likedBy = Array.isArray(blog.likedBy) ? blog.likedBy : [];
    if (likedBy.includes(deviceId)) {
      return res.status(200).json({ likes: blog.likes ?? 0, liked: true });
    }
    likedBy.push(deviceId);
    const likes = (blog.likes ?? 0) + 1;
    await Blog.updateBlog(req.params.id, { likes, likedBy });
    res.json({ likes, liked: true });
  } catch (e) {
    res.status(500).json({ message: "Failed to like blog" });
  }
};

// Decrement likes by 1 (never below 0)
export const unlikeBlog = async (req, res) => {
  try {
    const deviceId = req.body.deviceId;
    if (!deviceId) return res.status(400).json({ message: "Missing deviceId" });
    const blog = await Blog.getBlogById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });
    let likedBy = Array.isArray(blog.likedBy) ? blog.likedBy : [];
    if (!likedBy.includes(deviceId)) {
      return res.status(200).json({ likes: blog.likes ?? 0, liked: false });
    }
    likedBy = likedBy.filter(id => id !== deviceId);
    const likes = Math.max((blog.likes ?? 0) - 1, 0);
    await Blog.updateBlog(req.params.id, { likes, likedBy });
    res.json({ likes, liked: false });
  } catch (e) {
    res.status(500).json({ message: "Failed to unlike blog" });
  }
};
