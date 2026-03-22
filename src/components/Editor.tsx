"use client";
import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { Sparkles, X } from 'lucide-react';

export default function Editor({ 
  file, 
  onCodeChange, 
  onClose 
}: { 
  file: any, 
  onCodeChange: (code: string) => void,
  onClose: () => void
}) {
  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-secondary bg-[#1e1e1e] select-none">
        <div className="flex flex-col items-center gap-6 opacity-40">
          <div className="p-8 border-2 border-dashed border-[#333] rounded-2xl">
            <Sparkles size={64} className="text-accent" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-medium text-text-primary">MVS Code</h2>
            <p className="text-sm">Select a file from the explorer or ask AI to start a project</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4 text-[13px]">
            <div className="flex justify-between gap-4"><span>Show All Commands</span><span className="text-text-primary opacity-80">Ctrl+Shift+P</span></div>
            <div className="flex justify-between gap-4"><span>Go to File</span><span className="text-text-primary opacity-80">Ctrl+P</span></div>
            <div className="flex justify-between gap-4"><span>Find in Files</span><span className="text-text-primary opacity-80">Ctrl+Shift+F</span></div>
            <div className="flex justify-between gap-4"><span>Start Debugging</span><span className="text-text-primary opacity-80">F5</span></div>
          </div>
        </div>
      </div>
    );
  }

  const isImage = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '');
  };

  if (isImage(file.name)) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col bg-[#1e1e1e]">
        <div className="tabs h-9 flex bg-[#1e1e1e] border-b border-[#333]">
          <div className="tab active px-4 flex items-center gap-3 text-sm border-t border-accent bg-[#252526] text-white">
            <span className="truncate max-w-[200px]">{file.name}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              className="p-1 hover:bg-[#333] rounded transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <img 
            src={file.content.startsWith('data:') ? file.content : `data:image/${file.name.split('.').pop()};base64,${file.content}`} 
            alt={file.name} 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
          />
        </div>
      </div>
    );
  }

  const getExtensions = () => {
    const ext = file.name.split('.').pop();
    if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') return [javascript()];
    if (ext === 'html') return [html()];
    if (ext === 'css') return [css()];
    return [javascript()];
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="tabs h-9 flex bg-[#1e1e1e] border-b border-[#333]">
        <div className="tab active px-4 flex items-center gap-3 text-sm border-t border-accent bg-[#252526] text-white">
          <span className="truncate max-w-[200px]">{file.name}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="p-1 hover:bg-[#333] rounded transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={file.content}
          height="100%"
          theme={dracula}
          extensions={getExtensions()}
          onChange={(value) => onCodeChange(value)}
          className="h-full text-base"
        />
      </div>
    </div>
  );
}
