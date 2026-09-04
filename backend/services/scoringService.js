import { Assessment } from '../models/Assessment.js';
import { User } from '../models/User.js';

const CERTIFICATION_THRESHOLD = 70; // % score needed to unlock certification

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
  const score = correct ? 10 : 0; // flat scoring for the MVP - tune once real content lands

  const assessment = await Assessment.create({
    userId,
    scenarioId: scenario.id,
    selectedAnswer,
    correct,
    score,
  });

  return {
    assessment,
    correct,
    explanation: scenario.explanation,
  };
}

export async function computeOverallScore(userId) {
  const assessments = await Assessment.findByUser(userId);

  if (assessments.length === 0) {
    return { totalScore: 0, percentage: 0, eligibleForCertificate: false };
  }

  const totalScore = assessments.reduce((sum, a) => sum + a.score, 0);
  const maxPossible = assessments.length * 10;
  const percentage = Math.round((totalScore / maxPossible) * 100);

  await User.updateScore(userId, totalScore);

  return {
    totalScore,
    percentage,
    eligibleForCertificate: percentage >= CERTIFICATION_THRESHOLD,
  };
}
