import { asyncHandler, successResponse } from '../utils/helpers.js';
import { Scenario } from '../models/Scenario.js';
import { Assessment } from '../models/Assessment.js';
import {
  submitAnswer,
  computeOverallScore,
  computeModuleProgress,
} from '../services/scoringService.js';

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

  successResponse(res, result, 201);
});

// GET /api/assessments/score
// Overall fraud-prevention score + per-category skill profile + level.
export const getMyScore = asyncHandler(async (req, res) => {
  const score = await computeOverallScore(req.user.id);
  successResponse(res, score);
});

// GET /api/assessments/profile
// Focused Fraud Prevention Skill Profile for the profile screen.
export const getMySkillProfile = asyncHandler(async (req, res) => {
  const { percentage, level, attempts, correctCount, skillProfile } =
    await computeOverallScore(req.user.id);
  successResponse(res, {
    overallPercentage: percentage,
    level,
    attempts,
    correctCount,
    skillProfile,
  });
});

// GET /api/assessments/history
// The learner's past attempts, most recent first, with scenario context.
export const getMyHistory = asyncHandler(async (req, res) => {
  const history = await Assessment.findHistoryByUser(req.user.id);
  successResponse(res, history);
});

// GET /api/assessments/progress
// Per-module completion, derived from the learner's answered scenarios.
export const getMyProgress = asyncHandler(async (req, res) => {
  const progress = await computeModuleProgress(req.user.id);
  successResponse(res, progress);
});
