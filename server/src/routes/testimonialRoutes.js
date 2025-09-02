import express from 'express';
import { sendTestimonial } from '../controllers/testimonialController.js';

const router = express.Router();
router.post('/', sendTestimonial);

export default router;
