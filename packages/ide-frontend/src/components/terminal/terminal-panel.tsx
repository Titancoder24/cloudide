'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { workspaceClient } from '@/lib/workspace-client';
import { useWorkspace } from '@/hooks/useWorkspace';

export function TerminalPanel() {
  const { terminalHistory } = useWorkspace();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [terminalHistory]);

  const exec = useCallback((cmd: string) => {
    const t = cmd.trim();
    if (!t) return;
    setHistory((p) => [...p, t]);
    setHIdx(-1);
    workspaceClient.addTerminalEntry({ type: 'input', text: `$ ${t}`, timestamp: Date.now() });

    const [c, ...a] = t.split(/\s+/);
    let out = '', tp: 'output' | 'error' | 'system' = 'output';

    switch (c) {
      case 'help': out = 'Commands: help, clear, ls, cat, echo, pwd, date, node -v, npm install/run, touch, rm, export'; break;
      case 'clear': workspaceClient.clearTerminal(); setInput(''); return;
      case 'ls': { const f = workspaceClient.getAllFilePaths(); const d = a[0]||''; out = (d ? f.filter(x=>x.startsWith(d)) : f).join('\n') || '(empty)'; break; }
      case 'cat': if(!a[0]){out='Usage: cat <file>';tp='error';break;} workspaceClient.readFile(a[0]).then(x=>workspaceClient.addTerminalEntry({type:x?'output':'error',text:x||`cat: ${a[0]}: No such file`,timestamp:Date.now()})); setInput(''); return;
      case 'echo': out = a.join(' '); break;
      case 'pwd': out = `/workspace/${workspaceClient.getState().projectName||''}`; break;
      case 'date': out = new Date().toString(); break;
      case 'node': out = a[0]==='-v' ? 'v22.22.0 (NodePod)' : 'Usage: node -v'; break;
      case 'npm': out = `npm ${a[0]||''} — simulated in IDE`; tp = 'system'; break;
      case 'touch': if(a[0]){workspaceClient.createFile(a[0],'');out=`Created ${a[0]}`;tp='system';}else{out='Usage: touch <file>';tp='error';} break;
      case 'rm': if(a[0]){workspaceClient.deleteFile(a[0]);out=`Deleted ${a[0]}`;tp='system';}else{out='Usage: rm <file>';tp='error';} break;
      case 'export': out = JSON.stringify(workspaceClient.exportWorkspace(),null,2); break;
      default: out = `command not found: ${c}\nType "help" for commands.`; tp = 'error';
    }
    if (out) workspaceClient.addTerminalEntry({ type: tp, text: out, timestamp: Date.now() });
    setInput('');
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { exec(input); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if(history.length){const i=hIdx<0?history.length-1:Math.max(0,hIdx-1);setHIdx(i);setInput(history[i]);} }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if(hIdx>=0){const i=hIdx+1;if(i>=history.length){setHIdx(-1);setInput('');}else{setHIdx(i);setInput(history[i]);}} }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); workspaceClient.clearTerminal(); }
  };

  const color = (t: string) => {
    if (t === 'input') return 'text-ide-success';
    if (t === 'error') return 'text-ide-error';
    if (t === 'system') return 'text-ide-info';
    return 'text-ide-text';
  };

  return (
    <div className="flex h-full flex-col bg-ide-terminal" onClick={() => inputRef.current?.focus()}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[13px] leading-relaxed">
        {terminalHistory.map((e, i) => (
          <div key={i} className={`whitespace-pre-wrap break-all ${color(e.type)}`}>{e.text}</div>
        ))}
      </div>
      <div className="flex shrink-0 items-center border-t border-ide-border px-3">
        <span className="mr-2 font-mono text-[13px] text-ide-success">$</span>
        <input
          ref={inputRef}
          className="flex-1 bg-transparent py-2 font-mono text-[13px] text-ide-text outline-none"
          value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey}
          placeholder="Type a command..." spellCheck={false}
        />
      </div>
    </div>
  );
}
