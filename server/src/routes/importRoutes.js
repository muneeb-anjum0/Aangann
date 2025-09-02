// Import routes
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { importDocx } from "../controllers/importController.js";
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();
router.post("/docx", requireAuth, upload.single("file"), importDocx);
export default router;
