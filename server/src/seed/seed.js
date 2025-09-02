// Seed database with initial data
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Blog from "../models/Blog.js";

export const ensureSeed = async () => {
  const email = process.env.ADMIN_EMAIL;
  const pwd = process.env.ADMIN_PASSWORD;
  let u = await User.getUserByEmail(email);
  if (!u) {
    const passwordHash = await bcrypt.hash(pwd, 10);
    await User.createUser({ email, passwordHash, role: "admin" });
    console.log("Seeded admin:", email);
  }
  // Minimal placeholder if none
  const blogs = await Blog.getAllBlogs();
  if (blogs.length === 0) {
    await Blog.createBlog({
      title: "5 Food Routines that are seen to perform well for PMS.",
      slug: "post-1",
      html: "<h2>What No One Tells You</h2><p>Placeholder content…</p>",
      excerpt: "Placeholder content…",
      minutesRead: 5,
      categories: ["Well-being", "Self-care", "Lifestyle"],
      placement: "top",
      isFeatured: true,
      thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    });
    console.log("Seeded one blog");
  }
};
