import { Router } from 'express';
import { getModules, getModuleById } from '../controllers/moduleController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, getModules);
router.get('/:id', requireAuth, getModuleById);

export default router;
