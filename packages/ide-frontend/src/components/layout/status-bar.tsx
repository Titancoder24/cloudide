'use client';

import { useWorkspace } from '@/hooks/useWorkspace';
import { useTheme } from '@/lib/theme';

export function StatusBar() {
  const { activeFile, openFiles, errors, projectName } = useWorkspace();
  const { c, theme } = useTheme();

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  return (
    <div className="flex h-6 flex-shrink-0 items-center justify-between px-3 text-[11px]" style={{ background: c.statusBar, color: c.statusBarText }}>
      <div className="flex items-center gap-3">
        <span className="font-medium">{projectName || 'LLM-IDE'}</span>
        {errorCount > 0 && (
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6" /></svg>
            {errorCount} error{errorCount !== 1 ? 's' : ''}
          </span>
        )}
        {warningCount > 0 && (
          <span className="flex items-center gap-1 opacity-80">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l7 14H1L8 1z" /></svg>
            {warningCount}
          </span>
        )}
        {errorCount === 0 && warningCount === 0 && (
          <span className="opacity-70">No problems</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {activeFile && <span>{activeFile.split('.').pop()?.toUpperCase()}</span>}
        <span>{openFiles.length} file{openFiles.length !== 1 ? 's' : ''} open</span>
        <span>{theme.name}</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#4ec9b0' }} />
          MCP Ready
        </span>
      </div>
    </div>
  );
}
