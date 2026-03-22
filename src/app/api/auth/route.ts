import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { action, username, password } = await request.json();

    if (action === 'signup') {
      const result = await db.execute({
        sql: 'INSERT INTO users (username, password) VALUES (?, ?)',
        args: [username, password]
      });
      const userId = result.lastInsertRowid?.toString();
      if (userId) (await cookies()).set('user_id', userId);
      return NextResponse.json({ success: true, id: userId, username });
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
  } catch (error: any) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error",
      code: error.code // LibSQL error codes can help
    }, { status: 500 });
  }
}

export async function GET() {
  try {
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
  } catch (error: any) {
    console.error("Auth GET error:", error);
    return NextResponse.json(null); // Silent fail for GET is usually better for UI
  }
}


