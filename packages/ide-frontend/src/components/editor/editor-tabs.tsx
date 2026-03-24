'use client';

import { useWorkspace } from '@/hooks/useWorkspace';
import { useTheme } from '@/lib/theme';
import { CodeEditor } from './code-editor';

export function EditorTabs() {
  const { openFiles, activeFile, openFile, closeFile, projectName } = useWorkspace();
  const { c } = useTheme();

  if (openFiles.length === 0) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: c.editorBg }}>
        <div className="text-center" style={{ maxWidth: 360 }}>
          <div className="mb-4 text-4xl opacity-20">{'</>'}</div>
          <h3 className="mb-2 text-base font-medium" style={{ color: c.textPrimary }}>{projectName || 'LLM-IDE'}</h3>
          <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>
            Open a file from the Explorer to start editing, or connect an AI tool via MCP to let it code for you.
          </p>
          <div className="mt-4 flex flex-col items-center gap-1 text-xs" style={{ color: c.textSecondary }}>
            <span>Ctrl+P — Quick Open</span>
            <span>Ctrl+` — Toggle Terminal</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" style={{ background: c.editorBg }}>
      {/* Tab bar */}
      <div className="flex h-[35px] flex-shrink-0 items-end overflow-x-auto" style={{ background: c.bgSecondary }}>
        {openFiles.map((file) => {
          const isActive = file === activeFile;
          const name = file.split('/').pop() || file;
          return (
            <div
              key={file}
              className="group relative flex h-[34px] cursor-pointer items-center gap-1.5 px-3 text-[13px]"
              style={{
                background: isActive ? c.tabActive : c.tabInactive,
                color: isActive ? c.textPrimary : c.textSecondary,
                borderRight: `1px solid ${c.border}`,
                borderTop: isActive ? `2px solid ${c.accent}` : '2px solid transparent',
                marginTop: 1,
              }}
              onClick={() => openFile(file)}
            >
              <span className="max-w-[130px] truncate">{name}</span>
              <button
                className="flex h-4 w-4 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: c.textMuted }}
                onClick={(e) => { e.stopPropagation(); closeFile(file); }}
                onMouseEnter={(e) => (e.currentTarget.style.background = c.hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                ×
              </button>
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
