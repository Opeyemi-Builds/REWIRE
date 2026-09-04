import { Router } from 'express';
import { getEligibility } from '../controllers/ecobankController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/eligibility', requireAuth, getEligibility);

export default router;
