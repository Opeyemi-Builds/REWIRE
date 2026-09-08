import { Router } from 'express';
import { getRecommendation } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/recommendation', requireAuth, getRecommendation);

export default router;
