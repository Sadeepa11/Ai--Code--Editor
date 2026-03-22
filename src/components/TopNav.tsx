"use client";
import React from 'react';
import { 
  Sun, 
  Moon, 
  Sparkles, 
  Play, 
  Search, 
  LayoutGrid, 
  Columns, 
  Bell, 
  Settings, 
  User,
  MoreHorizontal
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function TopNav({ 
  onThemeToggle, 
  onRun, 
  theme, 
  activeFileName,
  onToggleSidebar,
  onToggleTerminal,
  onLogout,
  onPreview,
  folderName
}: { 
  onThemeToggle: () => void, 
  onAutoCorrect: () => void, 
  onRun: () => void,
  theme: string,
  activeFileName?: string | null,
  onToggleSidebar: () => void,
  onToggleTerminal: () => void,
  onLogout: () => void,
  onPreview?: () => void,
  folderName?: string
}) {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const menuItems = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'];

  // Handle click outside to close menu
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenu]);

  const handleMenuClick = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    if (item === 'File') {
      setActiveMenu(activeMenu === 'File' ? null : 'File');
    } else {
      if (item === 'Terminal') onToggleTerminal();
      if (item === 'View') onToggleSidebar();
      setActiveMenu(null);
    }
  };

  return (
    <nav className="h-10 bg-[#1e1e1e] border-b border-[#333] flex items-center justify-between px-2 shrink-0 text-text-secondary select-none relative z-50">
      {/* Left: Logo & Menu */}
      <div className="flex items-center gap-4 h-full">
        <div className="flex items-center gap-2 px-2 h-full hover:bg-[#2d2d2d] cursor-pointer">
          <span className="text-sm">🚀</span>
        </div>
        
        <div className="hidden md:flex items-center h-full">
          {menuItems.map((item) => (
            <div key={item} className="relative h-full flex items-center">
              <button 
                onClick={(e) => handleMenuClick(e, item)}
                className={`px-3 h-full text-[13px] hover:bg-[#2d2d2d] transition-colors ${activeMenu === item ? 'bg-[#2d2d2d] text-text-primary' : 'hover:text-text-primary'}`}
              >
                {item}
              </button>

              {/* File Dropdown Menu */}
              {item === 'File' && activeMenu === 'File' && (
                <div 
                  className="absolute top-full left-0 w-64 bg-[#252526] border border-[#454545] shadow-xl py-1 mt-0 flex flex-col z-[100]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => { onLogout(); setActiveMenu(null); }}
                    className="flex justify-between items-center px-4 py-1.5 hover:bg-[#007acc] text-white text-[13px] group"
                  >
                    <span>Logout</span>
                    <span className="text-[11px] opacity-50 group-hover:opacity-100">Ctrl+F4</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Center: Title */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 text-[12px] opacity-80 pointer-events-none whitespace-nowrap">
        {activeFileName && (
          <>
            <span className="text-text-primary font-medium">{activeFileName}</span>
            <span className="mx-1">-</span>
          </>
        )}
        <span>{folderName}</span>
        <span className="mx-1">-</span>
        <span>MVS Code</span>
      </div>

      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-1 h-full pr-1">
        <button 
          className="flex items-center gap-1.5 px-3 h-full text-[12px] hover:bg-[#2d2d2d] transition-colors"
        >
          <span>Open Agent Manager</span>
        </button>

        <div className="h-4 w-px bg-[#333] mx-1" />

        <div className="flex items-center gap-0.5 h-full">
          <button 
            onClick={onToggleSidebar}
            title="Toggle Sidebar" 
            className="p-1.5 hover:bg-[#2d2d2d] rounded transition-colors"
          >
            <Columns size={16} />
          </button>
          <button 
            onClick={onToggleTerminal}
            title="Toggle Terminal" 
            className="p-1.5 hover:bg-[#2d2d2d] rounded transition-colors"
          >
            <LayoutGrid size={16} />
          </button>
          <button title="Search" className="p-1.5 hover:bg-[#2d2d2d] rounded transition-colors">
            <Search size={16} />
          </button>
          
          <button 
            onClick={onThemeToggle}
            className="p-1.5 hover:bg-[#2d2d2d] rounded transition-colors"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {activeFileName?.endsWith('.html') && (
            <button 
              onClick={onPreview}
              className="flex items-center gap-1.5 px-3 h-7 text-[12px] font-bold bg-[#007acc] hover:bg-[#0062a3] text-white rounded transition-all"
            >
              <LayoutGrid size={12} fill="currentColor" />
              <span>PREVIEW</span>
            </button>
          )}

          <button 
            onClick={onRun}
            className="flex items-center gap-1.5 px-3 ml-1 h-7 text-[12px] font-bold bg-[#4BB543] hover:bg-[#3e9a37] text-white rounded transition-all"
          >
            <Play size={12} fill="currentColor" />
            <span>RUN</span>
          </button>

          <div className="h-4 w-px bg-[#333] mx-1" />

          <button title="Settings" className="p-1.5 hover:bg-[#2d2d2d] rounded transition-colors">
            <Settings size={16} />
          </button>
          <button title="User Profile" className="p-2 ml-1 bg-[#2d2d2d] rounded-full hover:ring-1 ring-accent transition-all">
            <User size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}

