import * as authService from '../services/authService.js';

// Protects routes: reads the Bearer token, resolves the Supabase user, and
// attaches it to req.user. The Express equivalent of FastAPI's
// Depends(get_current_user).
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token is required' });
    }

    req.user = await authService.getUser(token);

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
};
