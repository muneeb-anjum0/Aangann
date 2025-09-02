import express from 'express';
import { sendWaitlist } from '../controllers/waitlistController.js';

const router = express.Router();

router.post('/', sendWaitlist);

export default router;
