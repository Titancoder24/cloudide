'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { workspaceClient } from '@/lib/workspace-client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useTheme } from '@/lib/theme';

export function TerminalPanel() {
  const { terminalHistory } = useWorkspace();
  const { c } = useTheme();
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const termRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const execCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    workspaceClient.addTerminalEntry({ type: 'input', text: `$ ${trimmed}`, timestamp: Date.now() });

    const [command, ...args] = trimmed.split(/\s+/);
    let output = '';
    let type: 'output' | 'error' | 'system' = 'output';

    switch (command) {
      case 'help':
        output = [
          'Available commands:',
          '  help          — Show this help',
          '  clear         — Clear terminal',
          '  ls            — List files',
          '  cat <file>    — Display file contents',
          '  echo <text>   — Print text',
          '  pwd           — Print working directory',
          '  date          — Show current date',
          '  node -v       — Show Node.js version',
          '  npm install   — Install dependencies',
          '  npm run <s>   — Run script',
          '  touch <file>  — Create empty file',
          '  rm <file>     — Delete file',
          '  export        — Export workspace',
        ].join('\n');
        break;
      case 'clear':
        workspaceClient.clearTerminal();
        return;
      case 'ls': {
        const allFiles = workspaceClient.getAllFilePaths();
        const dir = args[0] || '';
        const filtered = dir ? allFiles.filter((f) => f.startsWith(dir)) : allFiles;
        output = filtered.length > 0 ? filtered.join('\n') : '(empty)';
        break;
      }
      case 'cat': {
        if (!args[0]) { output = 'Usage: cat <filename>'; type = 'error'; break; }
        workspaceClient.readFile(args[0]).then((content) => {
          workspaceClient.addTerminalEntry({
            type: content ? 'output' : 'error',
            text: content || `cat: ${args[0]}: No such file`,
            timestamp: Date.now(),
          });
        });
        return;
      }
      case 'echo':
        output = args.join(' ');
        break;
      case 'pwd':
        output = `/workspace/${workspaceClient.getState().projectName || ''}`;
        break;
      case 'date':
        output = new Date().toString();
        break;
      case 'node':
        output = args[0] === '-v' ? 'v22.22.0 (NodePod)' : 'Usage: node -v';
        break;
      case 'npm': {
        const sub = args[0];
        if (sub === 'install' || sub === 'i') {
          output = 'npm install simulated — packages would be installed via NodePod runtime.';
          type = 'system';
        } else if (sub === 'run') {
          output = args[1] ? `Running script "${args[1]}"...` : 'Usage: npm run <script>';
          type = 'system';
        } else {
          output = `npm ${sub || ''} — simulated in IDE environment`;
          type = 'system';
        }
        break;
      }
      case 'touch':
        if (args[0]) {
          workspaceClient.createFile(args[0], '');
          output = `Created ${args[0]}`;
          type = 'system';
        } else {
          output = 'Usage: touch <filename>';
          type = 'error';
        }
        break;
      case 'rm':
        if (args[0]) {
          workspaceClient.deleteFile(args[0]);
          output = `Deleted ${args[0]}`;
          type = 'system';
        } else {
          output = 'Usage: rm <filename>';
          type = 'error';
        }
        break;
      case 'export':
        output = JSON.stringify(workspaceClient.exportWorkspace(), null, 2);
        break;
      default:
        output = `command not found: ${command}\nType "help" for available commands.`;
        type = 'error';
    }

    if (output) {
      workspaceClient.addTerminalEntry({ type, text: output, timestamp: Date.now() });
    }
    setInput('');
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      execCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIdx = historyIdx < 0 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx >= 0) {
        const newIdx = historyIdx + 1;
        if (newIdx >= cmdHistory.length) { setHistoryIdx(-1); setInput(''); }
        else { setHistoryIdx(newIdx); setInput(cmdHistory[newIdx]); }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      workspaceClient.clearTerminal();
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'input': return c.success;
      case 'error': return c.error;
      case 'system': return c.info;
      default: return c.textPrimary;
    }
  };

  return (
    <div className="flex h-full flex-col" style={{ background: c.terminalBg }}
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={termRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[13px] leading-[1.5]">
        {terminalHistory.map((entry, i) => (
          <div key={i} className="whitespace-pre-wrap break-all" style={{ color: getColor(entry.type) }}>
            {entry.text}
          </div>
        ))}
      </div>
      <div className="flex flex-shrink-0 items-center border-t px-3" style={{ borderColor: c.border }}>
        <span className="mr-2 font-mono text-[13px]" style={{ color: c.success }}>$</span>
        <input
          ref={inputRef}
          className="flex-1 bg-transparent py-2 font-mono text-[13px] outline-none"
          style={{ color: c.textPrimary }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}
