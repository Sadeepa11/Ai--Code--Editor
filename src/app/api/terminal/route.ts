import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

// Persistent process and buffer storage for local development
const terminalSessions: any = (global as any).terminalSessions || {};
(global as any).terminalSessions = terminalSessions;

export async function POST(request: Request) {
  const userId = (await cookies()).get('user_id')?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, command, input, name, content } = await request.json();

  // 1. Sync file to disk
  if (action === 'sync') {
    if (!name) return NextResponse.json({ error: "Filename required" }, { status: 400 });
    try {
      const filePath = path.join(process.cwd(), name);
      // Ensure directory exists (if name contains folders)
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      fs.writeFileSync(filePath, content || '');
      return NextResponse.json({ success: true, path: filePath });
    } catch (err: any) {
      return NextResponse.json({ error: `Sync failed: ${err.message}` }, { status: 500 });
    }
  }

  // 2. Initial Spawn (e.g. start a shell or run a script)
  if (action === 'spawn' || action === 'command') {
    const cmdToRun = command || 'powershell.exe';
    
    // Kill existing process for this user if any
    if (terminalSessions[userId]?.process) {
      terminalSessions[userId].process.kill();
    }

    const proc = spawn(cmdToRun, {
      cwd: process.cwd(),
      shell: true,
      env: { ...process.env, FORCE_COLOR: '1' }
    });

    terminalSessions[userId] = {
      process: proc,
      buffer: '',
      lastUpdate: Date.now()
    };

    proc.stdout.on('data', (data) => {
      terminalSessions[userId].buffer += data.toString();
    });

    proc.stderr.on('data', (data) => {
      terminalSessions[userId].buffer += data.toString();
    });

    proc.on('close', (code) => {
      terminalSessions[userId].buffer += `\nProcess exited with code ${code}\n`;
      delete terminalSessions[userId].process;
    });

    return NextResponse.json({ success: true, message: "Process started" });
  }

  // 2. Send Input to Stdin
  if (action === 'input') {
    const session = terminalSessions[userId];
    if (session?.process) {
      session.process.stdin.write(input + '\n');
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "No active process" }, { status: 404 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET() {
  const userId = (await cookies()).get('user_id')?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = terminalSessions[userId];
  if (!session) return NextResponse.json({ output: "" });

  const output = session.buffer;
  session.buffer = ""; // Clear buffer after read
  return NextResponse.json({ output });
}

