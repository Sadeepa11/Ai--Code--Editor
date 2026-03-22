import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { action, username, password } = await request.json();

  if (action === 'signup') {
    try {
      const result = await db.execute({
        sql: 'INSERT INTO users (username, password) VALUES (?, ?)',
        args: [username, password]
      });
      const userId = result.lastInsertRowid?.toString();
      if (userId) (await cookies()).set('user_id', userId);
      return NextResponse.json({ success: true, id: userId, username });
    } catch (e: any) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }
  }

  if (action === 'login') {
    const result = await db.execute({
      sql: 'SELECT id, username FROM users WHERE username = ? AND password = ?',
      args: [username, password]
    });
    const user = result.rows[0];
    if (user) {
      (await cookies()).set('user_id', user.id!.toString());
      return NextResponse.json({ success: true, ...user });
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (action === 'logout') {
    (await cookies()).delete('user_id');
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET() {
  const userId = (await cookies()).get('user_id')?.value;
  if (userId) {
    const result = await db.execute({
      sql: 'SELECT id, username FROM users WHERE id = ?',
      args: [userId]
    });
    const user = result.rows[0];
    return NextResponse.json(user || null);
  }

  return NextResponse.json(null);
}

