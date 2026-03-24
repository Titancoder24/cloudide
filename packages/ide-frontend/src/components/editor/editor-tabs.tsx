'use client';

import { useWorkspace } from '@/hooks/useWorkspace';
import { CodeEditor } from './code-editor';

export function EditorTabs() {
  const { openFiles, activeFile, openFile, closeFile } = useWorkspace();

  if (openFiles.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[#858585]">
        <div className="text-center">
          <p className="mb-2 text-lg">No file open</p>
          <p className="text-sm">
            Select a file from the Explorer to start editing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex h-[35px] flex-shrink-0 overflow-x-auto border-b border-[#3e3e42] bg-[#252526]">
        {openFiles.map((file) => (
          <div
            key={file}
            className={`group flex cursor-pointer items-center border-r border-[#3e3e42] px-3 text-[13px] ${
              file === activeFile
                ? 'bg-[#1e1e1e] text-white'
                : 'bg-[#2d2d2d] text-[#858585] hover:bg-[#2a2d2e]'
            }`}
            onClick={() => openFile(file)}
          >
            <span className="max-w-[120px] truncate">
              {file.split('/').pop()}
            </span>
            <button
              className="ml-2 opacity-0 hover:text-white group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden">
        {activeFile && <CodeEditor filePath={activeFile} />}
      </div>
    </div>
  );
}
