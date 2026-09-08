import test from 'node:test';
import assert from 'node:assert/strict';

import { generateAssessmentFeedback } from '../services/aiService.js';

test('generateAssessmentFeedback returns a structured recommendation for incorrect answers', () => {
  const feedback = generateAssessmentFeedback({
    scenario: { category: 'social_engineering', title: 'Fake recruiter message' },
    selectedAnswer: 'B',
    correct: false,
    learnerScore: { percentage: 45, level: 'Fraud Aware' },
    skillArea: 'Social Engineering',
  });

  assert.equal(feedback.status, 'needs_attention');
  assert.ok(feedback.nextSkillFocus);
  assert.ok(feedback.recommendation.title);
  assert.ok(feedback.recommendation.text);
});

test('generateAssessmentFeedback returns a positive coaching response for correct answers', () => {
  const feedback = generateAssessmentFeedback({
    scenario: { category: 'digital_safety', title: 'Password hygiene check' },
    selectedAnswer: 'A',
    correct: true,
    learnerScore: { percentage: 80, level: 'Fraud Prevention Learner' },
    skillArea: 'Digital Safety',
  });

  assert.equal(feedback.status, 'good_progress');
  assert.equal(feedback.nextSkillFocus, 'Digital Safety');
  assert.ok(feedback.personalizedMessage.includes('strong'));
});
