import { jwtVerify } from 'jose';

const secret = process.env.JWT_SECRET!;

if (!secret) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

const secretKey = new TextEncoder().encode(secret);

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (e) {
    return null;
  }
}
