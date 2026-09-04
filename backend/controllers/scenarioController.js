import { asyncHandler, successResponse } from '../utils/helpers.js';
import { Scenario } from '../models/Scenario.js';

// GET /api/scenarios/module/:moduleId
export const getScenariosByModule = asyncHandler(async (req, res) => {
  const scenarios = await Scenario.findByModule(req.params.moduleId);
  successResponse(res, scenarios);
});

// GET /api/scenarios/:id
export const getScenarioById = asyncHandler(async (req, res) => {
  const scenario = await Scenario.findById(req.params.id);
  // Strip the answer/explanation before sending to the client - those only
  // get revealed after the user submits an answer (see assessmentController).
  const { correct_answer, explanation, ...safeScenario } = scenario;
  successResponse(res, safeScenario);
});
