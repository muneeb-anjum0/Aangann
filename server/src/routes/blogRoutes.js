// Blog routes
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

import {
  listAll, getBySlug, getById, sections,
  createBlog, updateBlog, removeBlog,
  likeBlog, unlikeBlog,
  updateBlogPlacement,
  mostLiked
} from "../controllers/blogController.js";

const router = Router();

router.get("/", listAll);
router.get("/sections", sections);
router.get("/most-liked", mostLiked);
router.get("/slug/:slug", getBySlug);
router.get("/:id", requireAuth, getById);

router.post("/", requireAuth, createBlog);
router.put("/:id", requireAuth, updateBlog);
// Placement/featured update (does NOT update updatedAt)
router.put("/:id/placement", requireAuth, updateBlogPlacement);
router.delete("/:id", requireAuth, removeBlog);

// Public like/dislike endpoints
router.post("/:id/like", likeBlog);
router.post("/:id/unlike", unlikeBlog);

export default router;
