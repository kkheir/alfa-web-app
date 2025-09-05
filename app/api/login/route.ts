import {NextRequest, NextResponse} from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import {signToken} from '@/lib/jwt';
import {cookies} from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const {username, password} = await req.json();

    if (!username || !password) {
      return NextResponse.json({message: 'Username and password are required'}, {status: 400});
    }

    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as {id: number; username: string; password: string; isAdmin: number} | undefined;

    if (!user) {
      return NextResponse.json({message: 'Invalid credentials'}, {status: 401});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({message: 'Invalid credentials'}, {status: 401});
    }

    const token = signToken({userId: user.id, username: user.username, isAdmin: !!user.isAdmin});

    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return NextResponse.json({message: 'Login successful', isAdmin: !!user.isAdmin});
  } catch (error) {
    console.error(error);
    return NextResponse.json({message: 'Internal server error'}, {status: 500});
  }
}
