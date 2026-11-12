import { verifyToken } from '../auth/token.js';

// the guard at the door: no valid token --> 401, valid token --> req.userId is set for the routes after
export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' '); // 'Bearer eyJ...' --> ['Bearer', 'eyJ...']
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    req.userId = verifyToken(token).sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
