'use client';

import { useWorkspace } from '@/hooks/useWorkspace';
import { useTheme } from '@/lib/theme';

export function ErrorsPanel() {
  const { errors } = useWorkspace();
  const { c } = useTheme();

  const openErrors = errors.filter((e) => e.status === 'open');

  return (
    <div className="flex h-full flex-col" style={{ background: c.terminalBg }}>
      <div className="flex-1 overflow-y-auto">
        {openErrors.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-lg" style={{ color: c.success }}>✓</div>
              <p className="text-xs" style={{ color: c.textSecondary }}>No problems detected</p>
            </div>
          </div>
        ) : (
          openErrors.map((error) => (
            <div
              key={error.id}
              className="flex cursor-pointer items-start gap-2 border-b px-3 py-2"
              style={{ borderColor: c.border }}
              onMouseEnter={(e) => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span className="mt-0.5 flex-shrink-0 text-xs" style={{
                color: error.severity === 'error' ? c.error : error.severity === 'warning' ? c.warning : c.info,
              }}>
                {error.severity === 'error' ? '●' : error.severity === 'warning' ? '▲' : 'ℹ'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs" style={{ color: c.textPrimary }}>{error.message}</p>
                {error.file && (
                  <p className="mt-0.5 text-[11px]" style={{ color: c.textMuted }}>
                    {error.file}{error.line ? `:${error.line}` : ''} — {error.type}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
