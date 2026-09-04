import { asyncHandler, successResponse } from '../utils/helpers.js';
import { Scenario } from '../models/Scenario.js';
import { submitAnswer, computeOverallScore } from '../services/scoringService.js';

// POST /api/assessments/submit
// body: { scenarioId, selectedAnswer }
export const submitAssessment = asyncHandler(async (req, res) => {
  const { scenarioId, selectedAnswer } = req.body;

  // validateBody guarantees the keys exist; guard against empty/blank values
  // so we don't pass a bad id straight into a Postgres query.
  if (!String(scenarioId).trim() || !String(selectedAnswer).trim()) {
    throw Object.assign(
      new Error('scenarioId and selectedAnswer must not be empty'),
      { status: 400 }
    );
  }

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
