import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

let projectRoot = process.cwd();

export async function GET() {
  return NextResponse.json({ projectRoot });
}

export async function POST(request: Request) {
  const { newRoot } = await request.json();
  if (newRoot && await fs.stat(newRoot).then(s => s.isDirectory()).catch(() => false)) {
    projectRoot = newRoot;
    await fs.writeFile(path.join(process.cwd(), '.project_root.txt'), newRoot, 'utf-8');
    return NextResponse.json({ success: true, projectRoot });
  }
  return NextResponse.json({ error: "Invalid path" }, { status: 400 });
}

export async function DELETE() {
  const configFile = path.join(process.cwd(), '.project_root.txt');
  try {
    await fs.unlink(configFile);
    projectRoot = process.cwd();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true }); // Already gone
  }
}
