import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET!;

if (!secret) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

export function signToken(payload: object) {
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}
