// Mock Ecobank integration for the MVP demo. Swap this out for a real call
// into /integrations/ecobank/ecobankAdapter.js once that workstream is ready -
// kept self-contained here so this backend runs standalone in the meantime.
export async function checkFinancialEligibility({ userId, fraudPreventionScore }) {
  const eligible = fraudPreventionScore >= 70;

  return {
    userId,
    eligible,
    riskTier: eligible ? 'low-risk' : 'needs-review',
    recommendedProduct: eligible ? 'Standard Digital Savings Account' : null,
  };
}
