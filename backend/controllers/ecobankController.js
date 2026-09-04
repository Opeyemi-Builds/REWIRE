import { asyncHandler, successResponse } from '../utils/helpers.js';
import { checkFinancialEligibility } from '../services/ecobankService.js';
import { computeOverallScore } from '../services/scoringService.js';

// GET /api/ecobank/eligibility
export const getEligibility = asyncHandler(async (req, res) => {
  const { percentage } = await computeOverallScore(req.user.id);
  const result = await checkFinancialEligibility({
    userId: req.user.id,
    fraudPreventionScore: percentage,
  });
  successResponse(res, result);
});
