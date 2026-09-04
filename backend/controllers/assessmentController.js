import { asyncHandler, successResponse } from '../utils/helpers.js';
import { Scenario } from '../models/Scenario.js';
import { submitAnswer, computeOverallScore } from '../services/scoringService.js';

// POST /api/assessments/submit
// body: { scenarioId, selectedAnswer }
export const submitAssessment = asyncHandler(async (req, res) => {
  const { scenarioId, selectedAnswer } = req.body;

  const scenario = await Scenario.findById(scenarioId); // full record, includes correct_answer
  const result = await submitAnswer({
    userId: req.user.id,
    scenario,
    selectedAnswer,
  });

  successResponse(res, result);
});

// GET /api/assessments/score
export const getMyScore = asyncHandler(async (req, res) => {
  const score = await computeOverallScore(req.user.id);
  successResponse(res, score);
});
