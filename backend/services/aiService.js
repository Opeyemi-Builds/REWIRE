const AI_PROVIDER = process.env.AI_PROVIDER || 'mock';

const skillAdvice = {
  fraud_awareness: 'Focus on spotting scam patterns, suspicious urgency, and misleading promises.',
  social_engineering: 'Practice recognizing pressure, impersonation, and trust-based manipulation tactics.',
  digital_safety: 'Reinforce account security habits, verification steps, and safer digital behavior.',
  scenario_analysis: 'Slow down and examine each clue before deciding whether a request is trustworthy.',
  critical_thinking: 'Challenge assumptions and verify claims before taking action.',
};

export function generateAssessmentFeedback({
  scenario,
  selectedAnswer,
  correct,
  learnerScore,
  skillArea,
}) {
  const category = scenario?.category || 'fraud_awareness';
  const currentSkill = skillArea || 'Fraud Awareness';
  const currentPercentage = learnerScore?.percentage ?? 0;
  const level = learnerScore?.level || 'Beginner';

  if (AI_PROVIDER === 'openai') {
    return {
      status: correct ? 'good_progress' : 'needs_attention',
      nextSkillFocus: currentSkill,
      personalizedMessage: correct
        ? `You handled this well. Your current score is ${currentPercentage}% and you are at ${level}. Keep building on your ${currentSkill.toLowerCase()} judgment.`
        : `This answer needed more verification. You are currently at ${currentPercentage}% and ${level}. Focus on ${skillAdvice[category] || skillAdvice.fraud_awareness}`,
      recommendation: {
        title: correct ? 'Keep reinforcing this strength' : 'Review the warning signs',
        text: correct
          ? `Your response shows good judgment. Continue checking urgency, identity, and verification steps before acting.`
          : `Revisit the scam patterns in this scenario and compare them with the trusted decision path before acting.`,
      },
      raw: null,
    };
  }

  // Mock provider: works without external AI keys and is safe for local dev/testing.
  if (correct) {
    return {
      status: 'good_progress',
      nextSkillFocus: currentSkill,
      personalizedMessage: `Your answer was correct. You are showing strong ${currentSkill.toLowerCase()} judgment, and your current score is ${currentPercentage}% (${level}). Keep building this pattern by verifying requests before acting.`,
      recommendation: {
        title: 'Keep reinforcing this skill',
        text: 'Continue to check urgency, identity, and trusted verification steps before responding to any digital request.',
      },
      raw: null,
    };
  }

  return {
    status: 'needs_attention',
    nextSkillFocus: currentSkill,
    personalizedMessage: `This one needed a closer look. Your score is ${currentPercentage}% (${level}), so the best next step is to focus on ${skillAdvice[category] || skillAdvice.fraud_awareness} Try the next scenario to reinforce the same pattern.`,
    recommendation: {
      title: 'Review the scam pattern',
      text: `The safer move is to slow down, verify the source, and check whether the request is urgent, unfamiliar, or pressure-based. ${selectedAnswer ? `You selected ${selectedAnswer}, but this scenario was trying to test the ${currentSkill.toLowerCase()} signal.` : 'The scenario was testing a key fraud-prevention signal.'}`,
    },
    raw: null,
  };
}

export async function getPersonalizedRecommendation({ userId, skillProfile = [], score = 0 }) {
  const strongestSkill = skillProfile.reduce((best, current) => {
    if (!best || current.percentage > best.percentage) return current;
    return best;
  }, null);

  const focus = strongestSkill?.label || 'Fraud Awareness';

  return {
    status: score >= 70 ? 'ready_for_next_step' : 'needs_attention',
    nextSkillFocus: focus,
    personalizedMessage:
      score >= 70
        ? `You are making strong progress. Keep reinforcing ${focus.toLowerCase()} and move toward more advanced fraud-prevention decisions.`
        : `You are still building confidence in ${focus.toLowerCase()}. Focus on a few more low-risk scenarios and verify each request before taking action.`,
    recommendation: {
      title: score >= 70 ? 'You are ready for the next challenge' : 'Review and repeat the core pattern',
      text:
        score >= 70
          ? 'Your score suggests you are ready to advance to harder scenarios and strengthen practical decision-making.'
          : 'Repeat the scenario pattern, focus on the warning signs, and practice verification before responding.',
    },
  };
}
