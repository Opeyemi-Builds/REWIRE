import { Router } from 'express';
import {
  submitAssessment,
  getMyScore,
  getMySkillProfile,
  getMyHistory,
} from '../controllers/assessmentController.js';
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
router.get('/profile', requireAuth, getMySkillProfile);
router.get('/history', requireAuth, getMyHistory);

export default router;
