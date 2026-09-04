import { Router } from 'express';
import { submitAssessment, getMyScore } from '../controllers/assessmentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateRequest.js';

const router = Router();

router.post(
  '/submit',
  requireAuth,
  validateBody(['scenarioId', 'selectedAnswer']),
  submitAssessment
);
router.get('/score', requireAuth, getMyScore);

export default router;
