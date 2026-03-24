'use client';

import { useState } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { FileEntry } from '@/lib/workspace-client';

export function FileExplorer() {
  const { files, openFile } = useWorkspace();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 items-center px-3 text-[11px] font-semibold uppercase tracking-wide text-[#858585]">
        Explorer
      </div>
      <div className="flex-1 overflow-y-auto text-[13px]">
        {files.map((entry) => (
          <FileNode key={entry.path} entry={entry} depth={0} onOpen={openFile} />
        ))}
      </div>
    </div>
  );
}

function FileNode({
  entry,
  depth,
  onOpen,
}: {
  entry: FileEntry;
  depth: number;
  onOpen: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);

  const paddingLeft = 12 + depth * 16;

  if (entry.type === 'directory') {
    return (
      <div>
        <div
          className="flex cursor-pointer items-center py-[2px] hover:bg-[#2a2d2e]"
          style={{ paddingLeft }}
          onClick={() => setExpanded(!expanded)}
        >
          <span className="mr-1 text-[10px] text-[#858585]">
            {expanded ? '▼' : '▶'}
          </span>
          <span className="text-[#cccccc]">{entry.name}</span>
        </div>
        {expanded &&
          entry.children?.map((child) => (
            <FileNode
              key={child.path}
              entry={child}
              depth={depth + 1}
              onOpen={onOpen}
            />
          ))}
      </div>
    );
  }

  return (
    <div
      className="flex cursor-pointer items-center py-[2px] hover:bg-[#2a2d2e]"
      style={{ paddingLeft }}
      onClick={() => onOpen(entry.path)}
    >
      <span className="mr-1.5 text-[10px]">{getFileIcon(entry.name)}</span>
      <span className="text-[#cccccc]">{entry.name}</span>
    </div>
  );
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop() || '';
  const icons: Record<string, string> = {
    ts: '🔷',
    tsx: '⚛️',
    js: '🟡',
    jsx: '⚛️',
    json: '📋',
    css: '🎨',
    html: '🌐',
    md: '📝',
    svg: '🖼️',
  };
  return icons[ext] || '📄';
}
