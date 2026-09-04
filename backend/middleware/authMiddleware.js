import { supabase } from '../config/db.js';

// Equivalent to a FastAPI dependency like `get_current_user`, added to a
// route via `Depends(...)`. Here, you just add `requireAuth` into the
// route's middleware chain instead.
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Attach the authenticated user to the request - same idea as FastAPI's
  // `current_user: User = Depends(get_current_user)` parameter.
  req.user = data.user;
  next();
}
