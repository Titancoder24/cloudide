'use client';

import { useEffect, useState } from 'react';
import { workspaceClient } from '@/lib/workspace-client';
import { FileExplorer } from '@/components/file-explorer/file-explorer';
import { EditorTabs } from '@/components/editor/editor-tabs';
import { TerminalPanel } from '@/components/terminal/terminal-panel';
import { PreviewPanel } from '@/components/preview/preview-panel';
import { StatusBar } from '@/components/layout/status-bar';
import { AIActivity } from '@/components/ai-cursor/ai-activity';

export function IDELayout() {
  const [ready, setReady] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [sidebarWidth, setSidebarWidth] = useState(240);

  useEffect(() => {
    workspaceClient.init().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-[#858585]">Initializing workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex h-9 items-center border-b border-[#3e3e42] bg-[#252526] px-3 text-xs">
        <span className="font-semibold text-white">LLM-IDE</span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`rounded px-2 py-0.5 ${showPreview ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-white'}`}
          >
            Preview
          </button>
          <button
            onClick={() => setShowActivity(!showActivity)}
            className={`rounded px-2 py-0.5 ${showActivity ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-white'}`}
          >
            AI Activity
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — File Explorer */}
        <div
          className="flex-shrink-0 border-r border-[#3e3e42] bg-[#252526]"
          style={{ width: sidebarWidth }}
        >
          <FileExplorer />
        </div>

        {/* Sidebar resize handle */}
        <div
          className="resize-handle w-[3px] cursor-col-resize"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = sidebarWidth;
            const onMove = (ev: MouseEvent) => {
              setSidebarWidth(
                Math.max(150, Math.min(500, startWidth + ev.clientX - startX))
              );
            };
            const onUp = () => {
              document.removeEventListener('mousemove', onMove);
              document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
          }}
        />

        {/* Editor + Terminal area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Editor */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <EditorTabs />
            </div>

            {/* Preview panel */}
            {showPreview && (
              <div className="w-[400px] border-l border-[#3e3e42]">
                <PreviewPanel />
              </div>
            )}
          </div>

          {/* Terminal resize handle */}
          <div
            className="resize-handle h-[3px] cursor-row-resize"
            onMouseDown={(e) => {
              const startY = e.clientY;
              const startH = terminalHeight;
              const onMove = (ev: MouseEvent) => {
                setTerminalHeight(
                  Math.max(100, Math.min(500, startH - (ev.clientY - startY)))
                );
              };
              const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
              };
              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onUp);
            }}
          />

          {/* Terminal */}
          <div
            className="flex-shrink-0 border-t border-[#3e3e42]"
            style={{ height: terminalHeight }}
          >
            <TerminalPanel />
          </div>
        </div>

        {/* AI Activity panel */}
        {showActivity && (
          <div className="w-[300px] border-l border-[#3e3e42] bg-[#252526]">
            <AIActivity />
          </div>
        )}
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
