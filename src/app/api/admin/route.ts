import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all users with their file counts
export async function GET() {
  try {
    const result = await db.execute(`
      SELECT u.id, u.username, COUNT(f.id) as file_count 
      FROM users u 
      LEFT JOIN files f ON u.id = f.user_id 
      GROUP BY u.id
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE user or clear all data
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('id');

  try {
    if (action === 'clear_all') {
      await db.execute('DELETE FROM files');
      await db.execute('DELETE FROM users');
      return NextResponse.json({ success: true, message: "All data cleared" });
    }

    if (userId) {
      await db.execute({
        sql: 'DELETE FROM users WHERE id = ?',
        args: [userId]
      });
      return NextResponse.json({ success: true, message: "User deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
