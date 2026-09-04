// Wraps an async route handler so any thrown error is automatically passed
// to Express's error handler, instead of needing try/catch in every controller.
// This is the Express equivalent of FastAPI automatically catching exceptions
// raised inside an `async def` path operation function.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function successResponse(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}
