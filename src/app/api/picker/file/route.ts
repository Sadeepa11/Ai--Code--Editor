import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execPromise = promisify(exec);

export async function GET() {
  const tempScriptPath = path.join(os.tmpdir(), `file_picker_${Date.now()}.ps1`);
  try {
    const psScript = `
Add-Type -AssemblyName System.Windows.Forms
$f = New-Object System.Windows.Forms.OpenFileDialog
$f.Title = "Select Project File"
# Ensure simple top-level display
$res = $f.ShowDialog((New-Object System.Windows.Forms.Form -Property @{TopMost=$true}))
if ($res -eq "OK") { $f.FileName }
`.trim();
    
    fs.writeFileSync(tempScriptPath, '\ufeff' + psScript, 'utf8');
    
    const { stdout, stderr } = await execPromise(`powershell -NoProfile -ExecutionPolicy Bypass -File "${tempScriptPath}"`);
    
    if (stderr) console.error('PowerShell Error:', stderr);

    const filePath = stdout.trim();
    
    try { fs.unlinkSync(tempScriptPath); } catch {}

    if (filePath) {
      return NextResponse.json({ path: filePath });
    } else {
      return NextResponse.json({ error: "No file selected" }, { status: 400 });
    }
  } catch (error: any) {
    try { fs.unlinkSync(tempScriptPath); } catch {}
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
