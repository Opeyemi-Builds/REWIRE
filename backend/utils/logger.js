// Tiny logger wrapper. morgan (in app.js) already logs each HTTP request -
// this is for logging inside services/controllers (e.g. caught errors,
// AI calls, ecobank calls).
const timestamp = () => new Date().toISOString();

export const logger = {
  info: (...args) => console.log(`[INFO ${timestamp()}]`, ...args),
  warn: (...args) => console.warn(`[WARN ${timestamp()}]`, ...args),
  error: (...args) => console.error(`[ERROR ${timestamp()}]`, ...args),
};
