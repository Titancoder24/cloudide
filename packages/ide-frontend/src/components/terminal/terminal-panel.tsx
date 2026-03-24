'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Terminal panel — simple interactive terminal.
 * In the full version, this connects to NodePod's shell.
 * For now, it provides a basic command execution interface.
 */
export function TerminalPanel() {
  const [history, setHistory] = useState<
    Array<{ type: 'input' | 'output'; text: string }>
  >([
    { type: 'output', text: 'LLM-IDE Terminal v0.1.0' },
    { type: 'output', text: 'Type "help" for available commands.\n' },
  ]);
  const [input, setInput] = useState('');
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setHistory((h) => [...h, { type: 'input', text: `$ ${trimmed}` }]);

    // Simple built-in commands for demo
    const commands: Record<string, () => string> = {
      help: () =>
        'Available commands: help, clear, echo, pwd, date, whoami, env',
      clear: () => {
        setHistory([]);
        return '';
      },
      pwd: () => '/workspace',
      date: () => new Date().toString(),
      whoami: () => 'llm-ide-user',
      env: () =>
        'NODE_ENV=development\nWORKSPACE=/workspace\nMCP_SERVER=localhost:3002',
    };

    const [command, ...args] = trimmed.split(' ');
    let output: string;

    if (command === 'echo') {
      output = args.join(' ');
    } else if (commands[command]) {
      output = commands[command]();
    } else {
      output = `command not found: ${command}\nIn production, this connects to NodePod's shell for full Node.js execution.`;
    }

    if (output) {
      setHistory((h) => [...h, { type: 'output', text: output }]);
    }
    setInput('');
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex h-8 items-center border-b border-[#3e3e42] px-3 text-[11px] font-semibold uppercase tracking-wide text-[#858585]">
        Terminal
      </div>
      <div
        ref={termRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-[13px]"
      >
        {history.map((entry, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap ${
              entry.type === 'input' ? 'text-[#4ec9b0]' : 'text-[#cccccc]'
            }`}
          >
            {entry.text}
          </div>
        ))}
      </div>
      <div className="flex items-center border-t border-[#3e3e42] px-2">
        <span className="mr-2 font-mono text-[13px] text-[#4ec9b0]">$</span>
        <input
          className="flex-1 bg-transparent py-1.5 font-mono text-[13px] text-[#cccccc] outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCommand(input);
          }}
          placeholder="Type a command..."
          autoFocus
        />
      </div>
    </div>
  );
}
