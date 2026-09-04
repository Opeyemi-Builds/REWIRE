import { asyncHandler, successResponse } from '../utils/helpers.js';
import { issueCertificateIfEligible } from '../services/certificateService.js';
import { Certificate } from '../models/Certificate.js';

// POST /api/certificates/issue
export const issueCertificate = asyncHandler(async (req, res) => {
  const certificate = await issueCertificateIfEligible(req.user.id);
  successResponse(res, certificate, 201);
});

// GET /api/certificates/me
export const getMyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findByUser(req.user.id);
  successResponse(res, certificate);
});
