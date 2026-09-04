import { asyncHandler, successResponse } from '../utils/helpers.js';
import { signUpUser, signInUser, getProfile } from '../services/authService.js';

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const data = await signUpUser({ name, email, password });
  successResponse(res, data, 201);
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await signInUser({ email, password });
  successResponse(res, data); // data.session.access_token is the Bearer token for protected routes
});

// GET /api/auth/me  (protected)
export const getMe = asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.id);
  successResponse(res, { ...req.user, profile });
});
