import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function getAuth() {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  return decoded as { userId: number; username: string; isAdmin: boolean } | null;
}

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PUT(req: Request, { params }: RouteParams) {
  const user = await getAuth();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    // Only allow updating non-admin users
    const stmt = db.prepare('UPDATE users SET password = ? WHERE id = ? AND isAdmin = 0');
    const info = stmt.run(hashedPassword, userId);

    if (info.changes === 0) {
      return NextResponse.json({ message: 'User not found or is an admin' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: RouteParams) {
  const user = await getAuth();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
  }
  
  if (userId === user.userId) {
    return NextResponse.json({ message: 'Admin cannot delete themselves' }, { status: 403 });
  }

  try {
    // Only allow deleting non-admin users
    const stmt = db.prepare('DELETE FROM users WHERE id = ? AND isAdmin = 0');
    const info = stmt.run(userId);

    if (info.changes === 0) {
      return NextResponse.json({ message: 'User not found or is an admin' }, { status: 404 });
    }

    revalidatePath('/admin');
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
