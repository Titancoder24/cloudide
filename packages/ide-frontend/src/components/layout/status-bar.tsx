'use client';

import { useWorkspace } from '@/hooks/useWorkspace';
import { useTheme } from '@/lib/theme';

export function StatusBar() {
  const { activeFile, openFiles, errors, projectName } = useWorkspace();
  const { theme } = useTheme();
  const errCount = errors.filter((e) => e.severity === 'error').length;
  const warnCount = errors.filter((e) => e.severity === 'warning').length;

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between bg-ide-statusbar px-3 text-[11px] text-ide-statusbar-text">
      <div className="flex items-center gap-3">
        <span className="font-medium">{projectName || 'LLM-IDE'}</span>
        {errCount > 0 && <span>{errCount} error{errCount !== 1 && 's'}</span>}
        {warnCount > 0 && <span className="opacity-80">{warnCount} warning{warnCount !== 1 && 's'}</span>}
        {errCount === 0 && warnCount === 0 && <span className="opacity-70">No problems</span>}
      </div>
      <div className="flex items-center gap-3">
        {activeFile && <span>{activeFile.split('.').pop()?.toUpperCase()}</span>}
        <span>{openFiles.length} open</span>
        <span>{theme.name}</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-ide-success" />MCP
        </span>
      </div>
    </footer>
  );
}
