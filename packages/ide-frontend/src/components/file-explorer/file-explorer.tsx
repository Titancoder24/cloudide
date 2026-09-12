'use client';

import { useState, useCallback } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { FileEntry } from '@/lib/workspace-client';

export function FileExplorer() {
  const { files, activeFile, openFile, createFile, deleteFile } = useWorkspace();
  const [newAt, setNewAt] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const submitNew = useCallback(() => {
    if (newAt !== null && newName.trim()) {
      createFile(newAt ? `${newAt}/${newName.trim()}` : newName.trim(), '');
      setNewAt(null);
      setNewName('');
    }
  }, [newAt, newName, createFile]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-ide-border px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ide-text-secondary">Explorer</span>
        <button onClick={() => { setNewAt(''); setNewName(''); }} className="text-sm text-ide-text-secondary hover:text-ide-text" title="New File">+</button>
      </div>
      <div className="flex-1 overflow-y-auto py-1 text-[13px]">
        {files.map((e) => (
          <Node key={e.path} entry={e} depth={0} activeFile={activeFile} onOpen={openFile} onNew={setNewAt} onDelete={deleteFile} />
        ))}
        {newAt === '' && (
          <div className="flex items-center py-0.5" style={{ paddingLeft: 16 }}>
            <input
              className="w-full border-b border-ide-accent bg-transparent px-1 text-xs text-ide-text outline-none"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitNew(); if (e.key === 'Escape') setNewAt(null); }}
              onBlur={() => { if (!newName.trim()) setNewAt(null); }}
              placeholder="filename.ts"
              autoFocus
            />
          </div>
        )}
        {files.length === 0 && <p className="px-3 py-4 text-center text-xs text-ide-text-muted">No files. Create a project or file.</p>}
      </div>
    </div>
  );
}

function Node({ entry, depth, activeFile, onOpen, onNew, onDelete }: {
  entry: FileEntry; depth: number; activeFile: string | null;
  onOpen: (p: string) => void; onNew: (p: string) => void; onDelete: (p: string) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const pl = 12 + depth * 18;
  const active = entry.path === activeFile;

  if (entry.type === 'directory') {
    return (
      <div>
        <div
          className="group flex cursor-pointer items-center py-[3px] pr-2 hover:bg-ide-hover"
          style={{ paddingLeft: pl }}
          onClick={() => setOpen(!open)}
        >
          <span className="mr-1.5 text-[10px] text-ide-text-muted">{open ? '▾' : '▸'}</span>
          <span className="text-ide-text">{entry.name}</span>
          <span
            className="ml-auto hidden cursor-pointer text-xs text-ide-text-muted group-hover:inline-block"
            onClick={(e) => { e.stopPropagation(); onNew(entry.path); }}
          >+</span>
        </div>
        {open && entry.children?.map((c) => (
          <Node key={c.path} entry={c} depth={depth + 1} activeFile={activeFile} onOpen={onOpen} onNew={onNew} onDelete={onDelete} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`group flex cursor-pointer items-center py-[3px] pr-2 ${active ? 'bg-ide-selected' : 'hover:bg-ide-hover'}`}
      style={{ paddingLeft: pl }}
      onClick={() => onOpen(entry.path)}
    >
      <span className="mr-1.5 text-[11px] text-ide-text-muted">{fileIcon(entry.name)}</span>
      <span className={active ? 'text-ide-text' : 'text-ide-text-secondary'}>{entry.name}</span>
      <span
        className="ml-auto hidden cursor-pointer text-xs text-ide-text-muted group-hover:inline-block"
        onClick={(e) => { e.stopPropagation(); onDelete(entry.path); }}
      >×</span>
    </div>
  );
}

function fileIcon(n: string): string {
  const e = n.split('.').pop() || '';
  return ({ ts: 'TS', tsx: 'TX', js: 'JS', jsx: 'JX', json: '{}', css: '#', html: '<>', md: 'M', svg: '◇' } as Record<string, string>)[e] || '·';
}
