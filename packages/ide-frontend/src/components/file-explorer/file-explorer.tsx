'use client';

import { useState, useCallback } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useTheme } from '@/lib/theme';
import type { FileEntry } from '@/lib/workspace-client';

export function FileExplorer() {
  const { files, activeFile, openFile, createFile, deleteFile } = useWorkspace();
  const { c } = useTheme();
  const [newFilePath, setNewFilePath] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  const handleNewFile = useCallback((dir: string) => {
    setNewFilePath(dir);
    setNewFileName('');
  }, []);

  const submitNewFile = useCallback(() => {
    if (newFilePath !== null && newFileName.trim()) {
      const path = newFilePath ? `${newFilePath}/${newFileName.trim()}` : newFileName.trim();
      createFile(path, '');
      setNewFilePath(null);
      setNewFileName('');
    }
  }, [newFilePath, newFileName, createFile]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-9 flex-shrink-0 items-center justify-between px-3" style={{ borderBottom: `1px solid ${c.border}` }}>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: c.textSecondary }}>
          Explorer
        </span>
        <button
          onClick={() => handleNewFile('')}
          className="flex h-5 w-5 items-center justify-center rounded text-sm"
          style={{ color: c.textSecondary }}
          title="New File"
        >
          +
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1 text-[13px]">
        {files.map((entry) => (
          <FileNode
            key={entry.path}
            entry={entry}
            depth={0}
            activeFile={activeFile}
            onOpen={openFile}
            onNewFile={handleNewFile}
            onDelete={deleteFile}
            c={c}
          />
        ))}

        {/* New file input at root */}
        {newFilePath === '' && (
          <div className="flex items-center py-0.5" style={{ paddingLeft: 16 }}>
            <input
              className="w-full bg-transparent px-1 text-xs outline-none"
              style={{ color: c.textPrimary, borderBottom: `1px solid ${c.accent}` }}
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitNewFile(); if (e.key === 'Escape') setNewFilePath(null); }}
              onBlur={() => setNewFilePath(null)}
              placeholder="filename.ts"
              autoFocus
            />
          </div>
        )}

        {files.length === 0 && (
          <div className="px-3 py-4 text-center text-xs" style={{ color: c.textMuted }}>
            No files yet. Create a new project or file.
          </div>
        )}
      </div>
    </div>
  );
}

function FileNode({
  entry, depth, activeFile, onOpen, onNewFile, onDelete, c,
}: {
  entry: FileEntry;
  depth: number;
  activeFile: string | null;
  onOpen: (path: string) => void;
  onNewFile: (dir: string) => void;
  onDelete: (path: string) => void;
  c: ReturnType<typeof useTheme>['c'];
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [showCtx, setShowCtx] = useState(false);
  const pl = 12 + depth * 18;
  const isActive = entry.path === activeFile;

  if (entry.type === 'directory') {
    return (
      <div>
        <div
          className="group flex cursor-pointer items-center py-[3px] pr-2"
          style={{
            paddingLeft: pl,
            background: showCtx ? c.hoverBg : 'transparent',
          }}
          onClick={() => setExpanded(!expanded)}
          onMouseEnter={(e) => (e.currentTarget.style.background = c.hoverBg)}
          onMouseLeave={(e) => {
            if (!showCtx) e.currentTarget.style.background = 'transparent';
          }}
          onContextMenu={(e) => { e.preventDefault(); setShowCtx(!showCtx); }}
        >
          <span className="mr-1.5 text-[10px]" style={{ color: c.textMuted }}>
            {expanded ? '▾' : '▸'}
          </span>
          <span style={{ color: c.textPrimary }}>{entry.name}</span>
          <span
            className="ml-auto hidden cursor-pointer text-xs group-hover:inline-block"
            style={{ color: c.textMuted }}
            onClick={(e) => { e.stopPropagation(); onNewFile(entry.path); }}
            title="New file in folder"
          >
            +
          </span>
        </div>
        {expanded && entry.children?.map((child) => (
          <FileNode
            key={child.path}
            entry={child}
            depth={depth + 1}
            activeFile={activeFile}
            onOpen={onOpen}
            onNewFile={onNewFile}
            onDelete={onDelete}
            c={c}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="group flex cursor-pointer items-center py-[3px] pr-2"
      style={{
        paddingLeft: pl,
        background: isActive ? c.selectedBg : 'transparent',
      }}
      onClick={() => onOpen(entry.path)}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = c.hoverBg; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = isActive ? c.selectedBg : 'transparent'; }}
    >
      <span className={`mr-1.5 text-[11px] ${getIconClass(entry.name)}`}>
        {getFileIcon(entry.name)}
      </span>
      <span style={{ color: isActive ? c.textPrimary : c.textSecondary }}>{entry.name}</span>
      <span
        className="ml-auto hidden cursor-pointer text-xs group-hover:inline-block"
        style={{ color: c.textMuted }}
        onClick={(e) => { e.stopPropagation(); onDelete(entry.path); }}
        title="Delete"
      >
        ×
      </span>
    </div>
  );
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop() || '';
  const icons: Record<string, string> = {
    ts: 'TS', tsx: 'TX', js: 'JS', jsx: 'JX', json: '{}',
    css: '#', scss: '#', html: '<>', md: 'M', svg: '◇',
    yaml: 'Y', yml: 'Y', env: '⚙', lock: '🔒',
  };
  return icons[ext] || '·';
}

function getIconClass(name: string): string {
  const ext = name.split('.').pop() || '';
  const classes: Record<string, string> = {
    ts: 'icon-ts', tsx: 'icon-ts', js: 'icon-js', jsx: 'icon-js',
    json: 'icon-json', css: 'icon-css', scss: 'icon-css', html: 'icon-html',
    md: 'icon-md', svg: 'icon-svg',
  };
  return classes[ext] || 'icon-default';
}
