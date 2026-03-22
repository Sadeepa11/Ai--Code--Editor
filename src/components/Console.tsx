"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, XCircle, ChevronRight } from 'lucide-react';

export default function Console({ 
  logs, 
  onClear, 
  onCommand 
}: { 
  logs: any[], 
  onClear: () => void,
  onCommand: (cmd: string) => void
}) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCommand(input.trim());
      setHistory(prev => [input.trim(), ...prev]);
      setHistoryIdx(-1);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIdx = Math.min(historyIdx + 1, history.length - 1);
      if (nextIdx >= 0) {
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(nextIdx);
      setInput(nextIdx === -1 ? '' : history[nextIdx]);
    }
  };

  return (
    <div 
      className="h-full bg-[#1e1e1e] border-t border-[#333] flex flex-col font-mono"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex justify-between items-center px-4 py-1.5 bg-[#252526] border-b border-[#333] text-[11px] font-bold text-gray-400 uppercase tracking-widest select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-4 border-b border-accent pb-1 -mb-1.5">
            <span className="text-white flex items-center gap-1.5">
              <TerminalIcon size={12} />
              TERMINAL
            </span>
          </div>
          <span className="opacity-40 hover:opacity-100 cursor-pointer ml-2">OUTPUT</span>
          <span className="opacity-40 hover:opacity-100 cursor-pointer">DEBUG CONSOLE</span>
        </div>
        <button 
          onClick={onClear} 
          className="hover:text-white transition-colors text-[10px]"
        >
          Clear
        </button>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 text-[13px] leading-relaxed scrollbar-thin scrollbar-thumb-[#333]"
      >
        {logs.length === 0 && (
          <div className="text-gray-600 italic opacity-50 mb-4 px-1">
            Welcome to Antigravity Terminal. Type your commands below.
          </div>
        )}
        {logs.map((log, idx) => (
          <div key={idx} className="mb-0 flex pr-1">
            <span className={`whitespace-pre-wrap font-mono ${log.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
              {log.msg}
            </span>
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2 group mb-4">
          <ChevronRight size={14} className="text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-gray-200"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
