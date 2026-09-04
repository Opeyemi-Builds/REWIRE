// Supabase Auth already issues and verifies JWTs for us (see
// middleware/authMiddleware.js), so we don't need to hand-roll
// signing/verification here.
//
// This helper is just for convenience if you ever need to peek at a
// token's payload while debugging. It does NOT verify the signature -
// never trust decoded data from this function for anything security-related.
export function decodeJwtPayload(token) {
  const payload = token.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
}
