'use client';

import { useWorkspace } from '@/hooks/useWorkspace';
import { CodeEditor } from './code-editor';

export function EditorTabs() {
  const { openFiles, activeFile, openFile, closeFile, projectName } = useWorkspace();

  if (openFiles.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-ide-editor">
        <div className="max-w-[360px] text-center">
          <div className="mb-4 text-4xl opacity-20">{'</>'}</div>
          <h3 className="mb-2 text-base font-medium text-ide-text">{projectName || 'LLM-IDE'}</h3>
          <p className="text-sm leading-relaxed text-ide-text-muted">
            Open a file from the Explorer, or connect an AI tool via MCP.
          </p>
          <div className="mt-4 flex flex-col items-center gap-1 text-xs text-ide-text-secondary">
            <span>Click a file in the sidebar to open it</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-ide-editor">
      {/* Tab bar */}
      <div className="flex h-[35px] shrink-0 items-end overflow-x-auto bg-ide-sidebar">
        {openFiles.map((file) => {
          const isActive = file === activeFile;
          const name = file.split('/').pop() || file;
          return (
            <div
              key={file}
              className={`group relative flex h-[34px] cursor-pointer items-center gap-1.5 border-r border-ide-border px-3 text-[13px] ${
                isActive
                  ? 'border-t-2 border-t-ide-accent bg-ide-tab-active text-ide-text'
                  : 'border-t-2 border-t-transparent bg-ide-tab-inactive text-ide-text-secondary hover:bg-ide-hover'
              }`}
              style={{ marginTop: 1 }}
              onClick={() => openFile(file)}
            >
              <span className="max-w-[130px] truncate">{name}</span>
              <button
                className="flex h-4 w-4 items-center justify-center rounded text-ide-text-muted opacity-0 transition-opacity hover:bg-ide-hover hover:text-ide-text group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); closeFile(file); }}
              >×</button>
            </div>
          );
        })}
      </div>

      {/* Editor */}
      <div className="min-h-0 flex-1">
        {activeFile && <CodeEditor key={activeFile} filePath={activeFile} />}
      </div>
    </div>
  );
}
