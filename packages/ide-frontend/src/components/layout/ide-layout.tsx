'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { workspaceClient } from '@/lib/workspace-client';
import { useTheme } from '@/lib/theme';
import { FileExplorer } from '@/components/file-explorer/file-explorer';
import { EditorTabs } from '@/components/editor/editor-tabs';
import { TerminalPanel } from '@/components/terminal/terminal-panel';
import { PreviewPanel } from '@/components/preview/preview-panel';
import { StatusBar } from '@/components/layout/status-bar';
import { AIActivity } from '@/components/ai-cursor/ai-activity';
import { SettingsPanel } from '@/components/settings/settings-panel';
import { ErrorsPanel } from '@/components/errors/errors-panel';

interface Props {
  onNewProject: () => void;
}

type RightPanel = 'none' | 'preview' | 'activity' | 'settings';
type BottomPanel = 'terminal' | 'errors';

export function IDELayout({ onNewProject }: Props) {
  const { c, theme } = useTheme();
  const [ready, setReady] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanel>('none');
  const [bottomPanel, setBottomPanel] = useState<BottomPanel>('terminal');
  const [bottomVisible, setBottomVisible] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [rightPanelWidth, setRightPanelWidth] = useState(360);
  const [bottomHeight, setBottomHeight] = useState(220);
  const [resizing, setResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    workspaceClient.init().then(() => setReady(true));
  }, []);

  // Resize helpers
  const startResize = useCallback(
    (axis: 'sidebar' | 'bottom' | 'right', startPos: number, startSize: number) => {
      setResizing(true);
      const onMove = (e: MouseEvent) => {
        if (axis === 'sidebar') {
          setSidebarWidth(Math.max(180, Math.min(500, startSize + e.clientX - startPos)));
        } else if (axis === 'bottom') {
          setBottomHeight(Math.max(120, Math.min(600, startSize - (e.clientY - startPos))));
        } else {
          setRightPanelWidth(Math.max(260, Math.min(600, startSize - (e.clientX - startPos))));
        }
      };
      const onUp = () => {
        setResizing(false);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    []
  );

  const toggleRight = (panel: RightPanel) => {
    setRightPanel((prev) => (prev === panel ? 'none' : panel));
  };

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: c.bgPrimary }}>
        <div className="text-center">
          <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: c.accent }} />
          <p className="text-sm" style={{ color: c.textSecondary }}>Initializing workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex h-screen flex-col ${resizing ? 'resizing' : ''}`} style={{ background: c.bgPrimary }}>
      {/* ── Title Bar ── */}
      <div className="flex h-10 flex-shrink-0 items-center justify-between border-b px-3" style={{ background: c.bgSecondary, borderColor: c.border }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>
            LLM-IDE
          </span>
          <span className="text-xs" style={{ color: c.textMuted }}>
            {workspaceClient.getState().projectName || 'Untitled'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <TitleBarBtn label="New" onClick={onNewProject} c={c} />
          <TitleBarBtn label="Terminal" active={bottomVisible && bottomPanel === 'terminal'} onClick={() => { setBottomVisible(true); setBottomPanel('terminal'); }} c={c} />
          <TitleBarBtn label="Problems" active={bottomVisible && bottomPanel === 'errors'} onClick={() => { setBottomVisible(true); setBottomPanel('errors'); }} c={c} />
          <div className="mx-1 h-4 w-px" style={{ background: c.border }} />
          <TitleBarBtn label="Preview" active={rightPanel === 'preview'} onClick={() => toggleRight('preview')} c={c} />
          <TitleBarBtn label="AI Activity" active={rightPanel === 'activity'} onClick={() => toggleRight('activity')} c={c} />
          <TitleBarBtn label="Settings" active={rightPanel === 'settings'} onClick={() => toggleRight('settings')} c={c} />
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <div className="flex-shrink-0 overflow-hidden" style={{ width: sidebarWidth, background: c.sidebarBg, borderRight: `1px solid ${c.border}` }}>
          <FileExplorer />
        </div>

        {/* Sidebar resize */}
        <div
          className="resize-handle-h"
          onMouseDown={(e) => startResize('sidebar', e.clientX, sidebarWidth)}
        />

        {/* Center: Editor + Bottom */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Editor */}
          <div className="min-h-0 flex-1 overflow-hidden" style={{ background: c.editorBg }}>
            <EditorTabs />
          </div>

          {/* Bottom resize */}
          {bottomVisible && (
            <>
              <div
                className="resize-handle-v"
                onMouseDown={(e) => startResize('bottom', e.clientY, bottomHeight)}
              />
              {/* Bottom panel */}
              <div className="flex-shrink-0 overflow-hidden" style={{ height: bottomHeight, borderTop: `1px solid ${c.border}` }}>
                <div className="flex h-full flex-col" style={{ background: c.terminalBg }}>
                  {/* Bottom panel tabs */}
                  <div className="flex h-8 flex-shrink-0 items-center gap-0.5 border-b px-2" style={{ borderColor: c.border }}>
                    <BottomTab label="Terminal" active={bottomPanel === 'terminal'} onClick={() => setBottomPanel('terminal')} c={c} />
                    <BottomTab label="Problems" active={bottomPanel === 'errors'} onClick={() => setBottomPanel('errors')} c={c} />
                    <div className="flex-1" />
                    <button
                      onClick={() => setBottomVisible(false)}
                      className="flex h-5 w-5 items-center justify-center rounded text-xs"
                      style={{ color: c.textSecondary }}
                    >
                      ×
                    </button>
                  </div>
                  {/* Panel content */}
                  <div className="min-h-0 flex-1">
                    {bottomPanel === 'terminal' ? <TerminalPanel /> : <ErrorsPanel />}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right panel */}
        {rightPanel !== 'none' && (
          <>
            <div
              className="resize-handle-h"
              onMouseDown={(e) => startResize('right', e.clientX, rightPanelWidth)}
            />
            <div className="panel-enter flex-shrink-0 overflow-hidden" style={{ width: rightPanelWidth, borderLeft: `1px solid ${c.border}` }}>
              {rightPanel === 'preview' && <PreviewPanel />}
              {rightPanel === 'activity' && <AIActivity />}
              {rightPanel === 'settings' && <SettingsPanel onClose={() => setRightPanel('none')} />}
            </div>
          </>
        )}
      </div>

      {/* ── Status Bar ── */}
      <StatusBar />
    </div>
  );
}

function TitleBarBtn({ label, active, onClick, c }: { label: string; active?: boolean; onClick: () => void; c: ReturnType<typeof useTheme>['c'] }) {
  return (
    <button
      onClick={onClick}
      className="rounded px-2 py-1 text-xs font-medium transition-colors"
      style={{
        background: active ? c.accent : 'transparent',
        color: active ? '#fff' : c.textSecondary,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = c.hoverBg; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {label}
    </button>
  );
}

function BottomTab({ label, active, onClick, c }: { label: string; active: boolean; onClick: () => void; c: ReturnType<typeof useTheme>['c'] }) {
  return (
    <button
      onClick={onClick}
      className="rounded px-2 py-0.5 text-[11px] font-medium transition-colors"
      style={{
        background: active ? c.bgPrimary : 'transparent',
        color: active ? c.textPrimary : c.textSecondary,
      }}
    >
      {label}
    </button>
  );
}
