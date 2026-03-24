'use client';

import { useWorkspace } from '@/hooks/useWorkspace';

export function ErrorsPanel() {
  const { errors } = useWorkspace();
  const open = errors.filter((e) => e.status === 'open');

  return (
    <div className="flex h-full flex-col bg-ide-terminal">
      <div className="flex-1 overflow-y-auto">
        {open.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-lg text-ide-success">✓</div>
              <p className="text-xs text-ide-text-secondary">No problems detected</p>
            </div>
          </div>
        ) : (
          open.map((e) => (
            <div key={e.id} className="flex cursor-pointer items-start gap-2 border-b border-ide-border px-3 py-2 hover:bg-ide-hover">
              <span className={`mt-0.5 shrink-0 text-xs ${e.severity === 'error' ? 'text-ide-error' : e.severity === 'warning' ? 'text-ide-warning' : 'text-ide-info'}`}>
                {e.severity === 'error' ? '●' : e.severity === 'warning' ? '▲' : 'ℹ'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ide-text">{e.message}</p>
                {e.file && <p className="mt-0.5 text-[11px] text-ide-text-muted">{e.file}{e.line ? `:${e.line}` : ''} — {e.type}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
