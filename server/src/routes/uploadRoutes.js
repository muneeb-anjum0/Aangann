// Upload routes
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { uploadImage, pingCloudinary } from "../controllers/uploadController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const router = Router();
router.get("/ping", requireAuth, pingCloudinary);
router.post("/image", requireAuth, upload.single("image"), uploadImage);
export default router;
