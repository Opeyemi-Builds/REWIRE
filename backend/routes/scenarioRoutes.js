import { Router } from 'express';
import { getScenariosByModule, getScenarioById } from '../controllers/scenarioController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/module/:moduleId', requireAuth, getScenariosByModule);
router.get('/:id', requireAuth, getScenarioById);

export default router;
