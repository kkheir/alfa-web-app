import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function getAuth() {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  return decoded as { userId: number; username: string; isAdmin: boolean } | null;
}

export async function GET() {
  const user = await getAuth();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = db.prepare('SELECT id, username FROM users WHERE isAdmin = 0').all();
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuth();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create a normal user by default
    const stmt = db.prepare('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)');
    const info = stmt.run(username, hashedPassword, 0);

    const newUser = {
      id: info.lastInsertRowid,
      username,
    };

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
