import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

// the token only holds the user id (sub): anyone can decode a JWT, so no secrets inside
export function signToken(user) {
  return jwt.sign({ sub: user._id }, SECRET, { expiresIn: '1h' });
}

// throws if someone changed the token or if it expired
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
