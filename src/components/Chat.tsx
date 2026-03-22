"use client";
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { marked } from 'marked';

export default function Chat({ messages, onSendMessage, isLoading }: { 
  messages: any[], 
  onSendMessage: (text: string) => void,
  isLoading: boolean 
}) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <aside className="w-full bg-background border-l border-border-color flex flex-col h-full overflow-hidden">
      <div className="p-3 px-4 border-b border-border-color text-xs font-semibold text-text-secondary uppercase tracking-wider">
        AI ASSISTANT
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[95%] p-3 rounded-xl text-[13px] leading-relaxed shadow-sm ${
              m.role === 'user' ? 'bg-accent text-white shadow-accent/20' : 'bg-sidebar border border-border-color text-text-primary'
            }`}>
              {m.role === 'user' ? m.content : (
                <div 
                  dangerouslySetInnerHTML={{ __html: marked.parse(m.content) }} 
                  className="markdown-chat overflow-x-auto max-w-full" 
                />
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-text-secondary animate-pulse px-2">AI is thinking...</div>}
      </div>
      <div className="p-4 border-t border-border-color">
        <div className="relative group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI or 'Create a project'..."
            className="w-full bg-sidebar border border-border-color rounded-md py-2 px-3 pr-10 text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1.5 text-text-secondary hover:text-accent transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
