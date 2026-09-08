export async function mockEcobankClient() {
  return {
    eligible: false,
    source: 'mock',
    message: 'Ecobank integration is ready for live credentials.',
  };
}
