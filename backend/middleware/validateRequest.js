// Minimal request-body validator - no external library needed for a
// hackathon. Conceptually the lightweight version of what a FastAPI
// Pydantic schema does automatically when validating a request body.
export function validateBody(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => !(field in (req.body || {})));

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required field(s): ${missing.join(', ')}`,
      });
    }

    next();
  };
}
