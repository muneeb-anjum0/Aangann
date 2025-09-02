import express from 'express';
import { sendFAQ } from '../controllers/faqController.js';

const router = express.Router();
router.post('/', sendFAQ);

export default router;
