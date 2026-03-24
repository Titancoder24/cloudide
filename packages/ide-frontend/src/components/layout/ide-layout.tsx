'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { workspaceClient } from '@/lib/workspace-client';
import { FileExplorer } from '@/components/file-explorer/file-explorer';
import { EditorTabs } from '@/components/editor/editor-tabs';
import { TerminalPanel } from '@/components/terminal/terminal-panel';
import { PreviewPanel } from '@/components/preview/preview-panel';
import { StatusBar } from '@/components/layout/status-bar';
import { AIActivity } from '@/components/ai-cursor/ai-activity';
import { SettingsPanel } from '@/components/settings/settings-panel';
import { ErrorsPanel } from '@/components/errors/errors-panel';

interface Props { onNewProject: () => void }

type RightPanel = 'none' | 'preview' | 'activity' | 'settings';
type BottomTab = 'terminal' | 'errors';

export function IDELayout({ onNewProject }: Props) {
  const [ready, setReady] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanel>('none');
  const [bottomTab, setBottomTab] = useState<BottomTab>('terminal');
  const [bottomOpen, setBottomOpen] = useState(true);
  const [sideW, setSideW] = useState(250);
  const [rightW, setRightW] = useState(360);
  const [bottomH, setBottomH] = useState(220);
  const bodyRef = useRef<HTMLElement | null>(null);

  useEffect(() => { workspaceClient.init().then(() => setReady(true)); }, []);
  useEffect(() => { bodyRef.current = document.body; }, []);

  const startDrag = useCallback(
    (axis: 'x' | 'y', startPos: number, startSize: number, setter: (v: number) => void, min: number, max: number, invert = false) => {
      const cls = axis === 'x' ? 'resizing' : 'resizing-v';
      bodyRef.current?.classList.add(cls);
      const onMove = (e: MouseEvent) => {
        const delta = axis === 'x' ? e.clientX - startPos : e.clientY - startPos;
        setter(Math.max(min, Math.min(max, startSize + (invert ? -delta : delta))));
      };
      const onUp = () => {
        bodyRef.current?.classList.remove(cls);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    []
  );

  const toggleRight = (p: RightPanel) => setRightPanel((v) => v === p ? 'none' : p);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-ide-bg">
        <div className="text-center">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-ide-accent border-t-transparent" />
          <p className="text-sm text-ide-text-secondary">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-ide-bg">

      {/* ── Title Bar ── */}
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-ide-border bg-ide-sidebar px-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-ide-text">LLM-IDE</span>
          <span className="text-xs text-ide-text-muted">{workspaceClient.getState().projectName || 'Untitled'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Btn label="New" onClick={onNewProject} />
          <Btn label="Terminal" active={bottomOpen && bottomTab === 'terminal'} onClick={() => { setBottomOpen(true); setBottomTab('terminal'); }} />
          <Btn label="Problems" active={bottomOpen && bottomTab === 'errors'} onClick={() => { setBottomOpen(true); setBottomTab('errors'); }} />
          <div className="mx-1.5 h-4 w-px bg-ide-border" />
          <Btn label="Preview" active={rightPanel === 'preview'} onClick={() => toggleRight('preview')} />
          <Btn label="AI Activity" active={rightPanel === 'activity'} onClick={() => toggleRight('activity')} />
          <Btn label="Settings" active={rightPanel === 'settings'} onClick={() => toggleRight('settings')} />
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex min-h-0 flex-1">

        {/* Sidebar */}
        <aside className="shrink-0 overflow-hidden border-r border-ide-border bg-ide-sidebar" style={{ width: sideW }}>
          <FileExplorer />
        </aside>
        <div className="resize-h" onMouseDown={(e) => startDrag('x', e.clientX, sideW, setSideW, 180, 500)} />

        {/* Center */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Editor */}
          <div className="min-h-0 flex-1 overflow-hidden bg-ide-editor">
            <EditorTabs />
          </div>

          {/* Bottom panel */}
          {bottomOpen && (
            <>
              <div className="resize-v" onMouseDown={(e) => startDrag('y', e.clientY, bottomH, setBottomH, 120, 500, true)} />
              <div className="shrink-0 overflow-hidden border-t border-ide-border" style={{ height: bottomH }}>
                <div className="flex h-full flex-col bg-ide-terminal">
                  {/* Tabs */}
                  <div className="flex h-8 shrink-0 items-center gap-0.5 border-b border-ide-border px-2">
                    <BotTab label="Terminal" active={bottomTab === 'terminal'} onClick={() => setBottomTab('terminal')} />
                    <BotTab label="Problems" active={bottomTab === 'errors'} onClick={() => setBottomTab('errors')} />
                    <div className="flex-1" />
                    <button onClick={() => setBottomOpen(false)} className="flex h-5 w-5 items-center justify-center rounded text-xs text-ide-text-secondary hover:text-ide-text">
                      ×
                    </button>
                  </div>
                  <div className="min-h-0 flex-1">
                    {bottomTab === 'terminal' ? <TerminalPanel /> : <ErrorsPanel />}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right panel */}
        {rightPanel !== 'none' && (
          <>
            <div className="resize-h" onMouseDown={(e) => startDrag('x', e.clientX, rightW, setRightW, 260, 600, true)} />
            <aside className="shrink-0 overflow-hidden border-l border-ide-border" style={{ width: rightW }}>
              {rightPanel === 'preview' && <PreviewPanel />}
              {rightPanel === 'activity' && <AIActivity />}
              {rightPanel === 'settings' && <SettingsPanel onClose={() => setRightPanel('none')} />}
            </aside>
          </>
        )}
      </div>

      {/* ── Status Bar ── */}
      <StatusBar />
    </div>
  );
}

function Btn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-ide-accent text-white' : 'text-ide-text-secondary hover:bg-ide-hover hover:text-ide-text'
      }`}
    >
      {label}
    </button>
  );
}

function BotTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
        active ? 'bg-ide-bg text-ide-text' : 'text-ide-text-secondary hover:text-ide-text'
      }`}
    >
      {label}
    </button>
  );
}
