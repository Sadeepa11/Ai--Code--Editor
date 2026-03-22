import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execPromise = promisify(exec);

export async function GET() {
  const tempScriptPath = path.join(os.tmpdir(), `folder_picker_${Date.now()}.ps1`);
  try {
    const psScript = `
Add-Type -AssemblyName System.Windows.Forms
$f = New-Object System.Windows.Forms.FolderBrowserDialog
$f.Description = "Select Project Folder"
# Ensure simple top-level display
$res = $f.ShowDialog((New-Object System.Windows.Forms.Form -Property @{TopMost=$true}))
if ($res -eq "OK") { $f.SelectedPath }
`.trim();
    
    fs.writeFileSync(tempScriptPath, '\ufeff' + psScript, 'utf8');
    
    const { stdout, stderr } = await execPromise(`powershell -NoProfile -ExecutionPolicy Bypass -File "${tempScriptPath}"`);
    
    if (stderr) console.error('PowerShell Error:', stderr);

    const folderPath = stdout.trim();
    
    // Clean up
    try { fs.unlinkSync(tempScriptPath); } catch {}

    if (folderPath) {
      return NextResponse.json({ path: folderPath });
    } else {
      return NextResponse.json({ error: "No folder selected" }, { status: 400 });
    }
  } catch (error: any) {
    try { fs.unlinkSync(tempScriptPath); } catch {}
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
