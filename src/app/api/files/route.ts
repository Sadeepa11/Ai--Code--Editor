import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const userId = (await cookies()).get('user_id')?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM files WHERE user_id = ?',
      args: [userId]
    });
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = (await cookies()).get('user_id')?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, content, type, folder_id } = await request.json();
    const result = await db.execute({
      sql: 'INSERT INTO files (user_id, name, content, type, folder_id) VALUES (?, ?, ?, ?, ?)',
      args: [userId, name, content || '', type || 'file', folder_id || null]
    });
    
    return NextResponse.json({ id: result.lastInsertRowid?.toString(), name, type, folder_id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = (await cookies()).get('user_id')?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, content, name } = await request.json();
    
    if (name !== undefined) {
      await db.execute({
        sql: 'UPDATE files SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        args: [name, id, userId]
      });
    } else if (content !== undefined) {
      await db.execute({
        sql: 'UPDATE files SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        args: [content, id, userId]
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = (await cookies()).get('user_id')?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await request.json();
    await db.execute({
      sql: 'DELETE FROM files WHERE id = ? AND user_id = ?',
      args: [id, userId]
    });
    // Recursion handled by ON DELETE CASCADE in SQLite schema
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

