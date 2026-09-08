import { asyncHandler, successResponse } from '../utils/helpers.js';
import { computeOverallScore } from '../services/scoringService.js';
import { getPersonalizedRecommendation } from '../services/aiService.js';

export const getRecommendation = asyncHandler(async (req, res) => {
  const score = await computeOverallScore(req.user.id);
  const recommendation = getPersonalizedRecommendation({
    userId: req.user.id,
    skillProfile: score.skillProfile,
    score: score.percentage,
  });

  successResponse(res, {
    ...recommendation,
    score: {
      percentage: score.percentage,
      level: score.level,
      eligibleForCertificate: score.eligibleForCertificate,
    },
  });
});
