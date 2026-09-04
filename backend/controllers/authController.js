import { asyncHandler, successResponse } from '../utils/helpers.js';
import * as authService from '../services/authService.js';
import { User } from '../models/User.js';

// POST /api/auth/register - body: { name, email, password }
export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    throw Object.assign(new Error('Email and password are required'), { status: 400 });
  }

  if (password.length < 6) {
    throw Object.assign(new Error('Password must be at least 6 characters'), { status: 400 });
  }

  const data = await authService.signup(email, password, name);

  successResponse(res, { user: data.user, session: data.session }, 201);
});

// POST /api/auth/login - body: { email, password }
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw Object.assign(new Error('Email and password are required'), { status: 400 });
  }

  const data = await authService.login(email, password);

  successResponse(res, { user: data.user, session: data.session });
});

// GET /api/auth/me - requires auth. req.user is set by requireAuth middleware.
export const me = asyncHandler(async (req, res) => {
  const profile = await User.findProfileById(req.user.id);

  successResponse(res, { user: req.user, profile });
});
