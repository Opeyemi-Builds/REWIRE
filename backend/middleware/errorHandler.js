// Centralized error handler. Controllers can throw an Error (optionally with
// a `.status` property) and it lands here instead of repeating try/catch
// in every single controller. Paired with `asyncHandler` in utils/helpers.js.
export function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ error: message });
}
