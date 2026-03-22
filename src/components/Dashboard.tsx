"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Editor from './Editor';
import Chat from './Chat';
import Console from './Console';
import TopNav from './TopNav';
import Swal from 'sweetalert2';

export default function Dashboard({ user, setUser }: { user: any, setUser: (user: any) => void }) {
  const [files, setFiles] = useState<any[]>([]);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    fetchFiles();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        (window as any).isKPressed = true;
        setTimeout(() => { (window as any).isKPressed = false; }, 1000);
      }
      if (e.ctrlKey && e.key === 'F4') {
        e.preventDefault();
        handleLogout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Start default terminal session
    fetch('/api/terminal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'spawn', command: 'powershell.exe' })
    });

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/terminal');
        const data = await res.json();
        if (data.output) {
          addLog(data.output);
        }
      } catch (err) {
        // Silent error for polling
      }
    }, 1000);
    return () => clearInterval(pollInterval);
  }, []);


  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFiles(data);
      if (data.length > 0 && !activeFileName) setActiveFileName(data[0].name);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
      setUser(null);
      setFiles([]);
      setActiveFileName(null);
      Swal.fire('Logged Out', 'Successfully logged out', 'success');
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  const currentFile = files.find(f => f.name === activeFileName);

  const handleSendMessage = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are an AI IDE assistant. Use "### FILE: [name.ext]" then "```[lang] [code] ```" to create/update files.' },
            { role: 'user', content: `Current Context: ${activeFileName}\nCode: ${currentFile?.content || 'None'}\n\nQuestion: ${text}` }
          ]
        })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      const aiResponse = data.choices[0]?.message?.content;
      if (!aiResponse) throw new Error("Invalid AI response");
      
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);

      const filePattern = /### FILE:\s*([^\n\r]+)[\s\S]*?```(?:[a-z]*)\n([\s\S]*?)```/g;
      let match;
      while ((match = filePattern.exec(aiResponse)) !== null) {
        const name = match[1].trim();
        const content = match[2].trim();
        await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, content })
        });
      }
      fetchFiles();
    } catch (err: any) {
      Swal.fire('AI Error', err.message || 'Failed to connect to AI server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFile = async (folderId?: number) => {
    const { value: name } = await Swal.fire({
      title: 'New File',
      input: 'text',
      inputPlaceholder: 'index.js',
      showCancelButton: true
    });
    if (name) {
      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content: '', type: 'file', folder_id: folderId })
      });
      fetchFiles();
    }
  };

  const handleCreateFolder = async (folderId?: number) => {
    const { value: name } = await Swal.fire({
      title: 'New Folder',
      input: 'text',
      inputPlaceholder: 'src',
      showCancelButton: true
    });
    if (name) {
      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content: '', type: 'folder', folder_id: folderId })
      });
      fetchFiles();
    }
  };

  const handleUploadImage = async (folderId?: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event: any) => {
          const base64 = event.target.result;
          await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name: file.name, 
              content: base64, 
              type: 'file', 
              folder_id: folderId 
            })
          });
          fetchFiles();
          Swal.fire('Uploaded', 'Image uploaded successfully', 'success');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleCodeChange = async (newContent: string) => {
    if (!currentFile) return;
    const updatedFiles = files.map(f => f.id === currentFile.id ? { ...f, content: newContent } : f);
    setFiles(updatedFiles);
    await fetch('/api/files', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: currentFile.id, 
        content: newContent
      })
    });
  };

  const handleDeleteFile = async (id: number) => {
    const fileToDelete = files.find(f => f.id === id);
    if (!fileToDelete) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete ${fileToDelete.name}? This is permanent!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchFiles();
      if (currentFile?.id === id) setActiveFileName(null);
      Swal.fire('Deleted!', 'The file has been removed from database.', 'success');
    }
  };

  const handleRenameFile = async (id: number, currentName: string) => {
    const fileToRename = files.find(f => f.id === id);
    if (!fileToRename) return;

    const { value: newName } = await Swal.fire({
      title: 'Rename',
      input: 'text',
      inputValue: currentName,
      showCancelButton: true
    });

    if (newName && newName !== currentName) {
      await fetch('/api/files', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          name: newName
        })
      });
      fetchFiles();
    }
  };

  const addLog = (msg: string, type: 'log' | 'error' = 'log') => {
    setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
  };

  const handleTerminalCommand = async (command: string) => {
    // Check if user is trying to run a specific script or just interacting
    const isSpecialCommand = command.startsWith('node ') || command.startsWith('npm ') || command.startsWith('python ');
    
    await fetch('/api/terminal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: isSpecialCommand ? 'spawn' : 'input', 
        command: isSpecialCommand ? command : undefined,
        input: isSpecialCommand ? undefined : command
      })
    });
  };

  const handleRun = async () => {
    if (!currentFile) return addLog('No file to run', 'error');

    // 1. Sync file to disk
    try {
      await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sync', 
          name: currentFile.name, 
          content: currentFile.content 
        })
      });
    } catch (err) {
      return addLog('Failed to sync file to disk', 'error');
    }

    // 2. Determine and trigger run command
    const ext = currentFile.name.split('.').pop()?.toLowerCase();
    let command = '';

    if (ext === 'js') {
      command = `node ${currentFile.name}`;
    } else if (ext === 'py') {
      command = `python ${currentFile.name}`;
    } else {
      return addLog(`Running .${ext} files is not yet supported. Please run manually in the terminal.`, 'error');
    }

    addLog(`Running ${command} in terminal...`);
    handleTerminalCommand(command);
    
    // Ensure terminal is visible
    if (!isTerminalVisible) setIsTerminalVisible(true);
  };

  const handlePreview = async () => {
    if (!activeFileName?.endsWith('.html')) return;
    
    // Sync all files for full project preview (CSS/JS links)
    try {
      await Promise.all(files.map(file => 
        fetch('/api/terminal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'sync', 
            name: file.name, 
            content: file.content 
          })
        })
      ));
      
      window.open(`/api/preview/${activeFileName}`, '_blank');
    } catch (err) {
      addLog('Failed to sync files for preview', 'error');
    }
  };

  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [chatWidth, setChatWidth] = useState(350);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingTerminal, setIsResizingTerminal] = useState(false);
  const [isResizingChat, setIsResizingChat] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isTerminalVisible, setIsTerminalVisible] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        setSidebarWidth(Math.max(150, Math.min(600, e.clientX)));
      }
      if (isResizingTerminal) {
        const height = window.innerHeight - e.clientY;
        setTerminalHeight(Math.max(100, Math.min(window.innerHeight - 200, height)));
      }
      if (isResizingChat) {
        setChatWidth(Math.max(200, Math.min(600, window.innerWidth - e.clientX)));
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingTerminal(false);
      setIsResizingChat(false);
    };

    if (isResizingSidebar || isResizingTerminal || isResizingChat) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingTerminal, isResizingChat]);

  const folderName = user ? `${user.username}'s Workspace` : "Not Logged In";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#1e1e1e] text-text-primary font-sans">
      <TopNav 
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onAutoCorrect={() => {}} 
        onRun={handleRun}
        activeFileName={activeFileName}
        folderName={folderName}
        onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        onToggleTerminal={() => setIsTerminalVisible(!isTerminalVisible)}
        onLogout={handleLogout}
        onPreview={handlePreview}
      />
      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarVisible && (
          <div style={{ width: sidebarWidth }} className="flex">
            <Sidebar 
              files={files} 
              activeFile={activeFileName} 
              onFileSelect={setActiveFileName} 
              onCreateFile={handleCreateFile}
              onCreateFolder={handleCreateFolder}
              onUploadImage={handleUploadImage}
              onDeleteFile={handleDeleteFile}
              onRenameFile={handleRenameFile}
            />
            {/* Sidebar Resizer */}
            <div 
              className="w-1 hover:bg-accent cursor-col-resize transition-colors z-10"
              onMouseDown={() => setIsResizingSidebar(true)}
            />
          </div>
        )}

        <main className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          <div className="flex-1 overflow-hidden flex flex-col">
            <Editor 
              file={currentFile} 
              onCodeChange={handleCodeChange} 
              onClose={() => setActiveFileName(null)}
            />
          </div>

          {isTerminalVisible && (
            <>
              {/* Terminal Resizer */}
              <div 
                className="h-1 hover:bg-accent cursor-row-resize transition-colors z-10"
                onMouseDown={() => setIsResizingTerminal(true)}
              />
              
              <div style={{ height: terminalHeight }}>
                <Console 
                  logs={logs} 
                  onClear={() => setLogs([])} 
                  onCommand={handleTerminalCommand}
                />
              </div>
            </>
          )}
        </main>

        <div style={{ width: chatWidth }} className="flex relative">
          {/* Chat Resizer */}
          <div 
            className="w-1 hover:bg-accent cursor-col-resize transition-colors z-10 absolute left-0 h-full"
            onMouseDown={() => setIsResizingChat(true)}
          />
          <Chat 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
}
