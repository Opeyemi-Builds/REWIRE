import { Router } from 'express';
import { register, login, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateRequest.js';

const router = Router();

router.post('/register', validateBody(['email', 'password']), register);
router.post('/login', validateBody(['email', 'password']), login);
router.get('/me', requireAuth, me);

export default router;
