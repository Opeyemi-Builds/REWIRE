import { Assessment } from '../models/Assessment.js';
import { Module } from '../models/Module.js';
import { Scenario } from '../models/Scenario.js';
import { User } from '../models/User.js';

const CERTIFICATION_THRESHOLD = 70; // % score needed to unlock certification
const POINTS_PER_CORRECT = 10; // flat scoring for the MVP - tune once real content lands

// The five canonical skill dimensions that make up the Fraud Prevention Skill
// Profile (see README section 17 / 22). scenarios.category is constrained to
// these keys in config/schema.sql, so the profile always has a fixed set of axes.
export const SKILL_CATEGORIES = {
  fraud_awareness: 'Fraud Awareness',
  social_engineering: 'Social Engineering',
  digital_safety: 'Digital Safety',
  scenario_analysis: 'Scenario Analysis',
  critical_thinking: 'Critical Thinking',
};

// Derive a learner level from the overall percentage. Names follow the
// product spec's "Fraud Prevention Learner / Analyst" language.
export function levelForPercentage(percentage) {
  if (percentage >= 90) return 'Fraud Prevention Analyst';
  if (percentage >= CERTIFICATION_THRESHOLD) return 'Fraud Prevention Learner';
  if (percentage >= 40) return 'Fraud Aware';
  return 'Beginner';
}

const pct = (earned, max) => (max === 0 ? 0 : Math.round((earned / max) * 100));

// Pure aggregation: turn a list of attempts (each with score/correct and its
// scenario's category) into the full score + per-category skill profile. No I/O,
// so it's easy to reason about and reuse.
function aggregate(attempts) {
  const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
  const maxPossible = attempts.length * POINTS_PER_CORRECT;
  const percentage = pct(totalScore, maxPossible);
  const correctCount = attempts.filter((a) => a.correct).length;

  // Always emit all five axes (0% when unattempted) so the frontend can render
  // a complete profile.
  const buckets = Object.fromEntries(
    Object.keys(SKILL_CATEGORIES).map((key) => [key, { earned: 0, max: 0, correct: 0, attempts: 0 }])
  );

  for (const a of attempts) {
    const category = a.scenarios?.category;
    if (!buckets[category]) continue; // unknown/legacy category - counts in overall, not a skill axis
    const b = buckets[category];
    b.earned += a.score;
    b.max += POINTS_PER_CORRECT;
    b.correct += a.correct ? 1 : 0;
    b.attempts += 1;
  }

  const skillProfile = Object.entries(SKILL_CATEGORIES).map(([key, label]) => ({
    category: key,
    label,
    attempts: buckets[key].attempts,
    correctCount: buckets[key].correct,
    percentage: pct(buckets[key].earned, buckets[key].max),
  }));

  return {
    totalScore,
    maxPossible,
    percentage,
    attempts: attempts.length,
    correctCount,
    certificationThreshold: CERTIFICATION_THRESHOLD,
    eligibleForCertificate: percentage >= CERTIFICATION_THRESHOLD,
    level: levelForPercentage(percentage),
    skillProfile,
  };
}

// Grade and record a single answer, then refresh the learner's stored progress.
export async function submitAnswer({ userId, scenario, selectedAnswer }) {
  // One attempt per scenario - stops users from re-answering to inflate their
  // score past the certification threshold.
  const existing = await Assessment.findByUserAndScenario(userId, scenario.id);
  if (existing) {
    throw Object.assign(
      new Error('You have already answered this scenario.'),
      { status: 409 }
    );
  }

  const correct = selectedAnswer === scenario.correct_answer;
  const pointsEarned = correct ? POINTS_PER_CORRECT : 0;

  const assessment = await Assessment.create({
    userId,
    scenarioId: scenario.id,
    selectedAnswer,
    correct,
    score: pointsEarned,
  });

  // Score update after each answer: recompute the overall total and persist it
  // (plus the derived level) to the learner profile.
  const summary = await computeOverallScore(userId);
  await User.updateProgress(userId, {
    totalScore: summary.totalScore,
    level: summary.level,
  });

  return {
    assessment,
    correct,
    pointsEarned,
    explanation: scenario.explanation,
    category: scenario.category,
    skillArea: SKILL_CATEGORIES[scenario.category] || null,
    // A snapshot of where the learner stands after this answer.
    score: {
      totalScore: summary.totalScore,
      percentage: summary.percentage,
      level: summary.level,
      eligibleForCertificate: summary.eligibleForCertificate,
    },
  };
}

// Read-only: overall score + full skill profile. Safe to call from any GET.
export async function computeOverallScore(userId) {
  const attempts = await Assessment.findByUserWithCategory(userId);
  return aggregate(attempts);
}

// Read-only: per-module completion, derived from which scenarios the learner
// has answered. Fills the `completedModules` view in the learner data model.
export async function computeModuleProgress(userId) {
  const [modules, scenarios, answeredIds] = await Promise.all([
    Module.findAll(),
    Scenario.findAllBrief(),
    Assessment.findAnsweredScenarioIds(userId),
  ]);

  const answered = new Set(answeredIds);
  const totals = {};
  const done = {};
  for (const s of scenarios) {
    totals[s.module_id] = (totals[s.module_id] || 0) + 1;
    if (answered.has(s.id)) done[s.module_id] = (done[s.module_id] || 0) + 1;
  }

  const perModule = modules.map((m) => {
    const total = totals[m.id] || 0;
    const answeredCount = done[m.id] || 0;
    return {
      moduleId: m.id,
      title: m.title,
      totalScenarios: total,
      answered: answeredCount,
      completed: total > 0 && answeredCount >= total,
      percentComplete: pct(answeredCount, total),
    };
  });

  return {
    modules: perModule,
    completedModules: perModule.filter((m) => m.completed).map((m) => m.moduleId),
  };
}

