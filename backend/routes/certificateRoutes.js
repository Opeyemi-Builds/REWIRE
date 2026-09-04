import { Router } from 'express';
import { issueCertificate, getMyCertificate } from '../controllers/certificateController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/issue', requireAuth, issueCertificate);
router.get('/me', requireAuth, getMyCertificate);

export default router;
