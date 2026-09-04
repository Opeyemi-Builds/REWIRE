// Placeholder AI layer for the MVP. Swap the body of this function for a
// real LLM API call (or import from the top-level /ai folder once that
// workstream is ready) - the controller/route calling this doesn't need
// to change either way.
export async function getPersonalizedFeedback({ weakArea, recentScore }) {
  // TODO: replace with a real LLM call, e.g.:
  // const response = await openai.chat.completions.create({ ... })

  return {
    weakArea,
    message: `You're at ${recentScore}% on ${weakArea}. Review the "${weakArea}" module's real-world examples, then try two more scenarios in that category.`,
    recommendedDifficulty: recentScore < 50 ? 'easy' : 'medium',
  };
}
