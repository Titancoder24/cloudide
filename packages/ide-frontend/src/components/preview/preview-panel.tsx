'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/theme';

export function PreviewPanel() {
  const { c } = useTheme();
  const [url, setUrl] = useState('');
  const [key, setKey] = useState(0);

  return (
    <div className="flex h-full flex-col" style={{ background: c.bgSecondary }}>
      {/* Toolbar */}
      <div className="flex h-9 flex-shrink-0 items-center gap-2 border-b px-2" style={{ borderColor: c.border }}>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="flex h-6 w-6 items-center justify-center rounded text-sm"
          style={{ color: c.textSecondary }}
          title="Refresh"
        >
          ↻
        </button>
        <input
          className="flex-1 rounded px-2 py-1 text-xs outline-none"
          style={{ background: c.bgInput, color: c.textPrimary, border: `1px solid ${c.border}` }}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setKey((k) => k + 1)}
          placeholder="http://localhost:3000"
          spellCheck={false}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {url ? (
          <iframe
            key={key}
            src={url}
            className="h-full w-full border-none"
            style={{ background: '#ffffff' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title="Preview"
          />
        ) : (
          <div className="p-6 text-center">
            <div className="mb-3 text-2xl opacity-20">🌐</div>
            <p className="mb-2 text-sm" style={{ color: c.textSecondary }}>No preview available</p>
            <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
              Run <code className="rounded px-1 py-0.5" style={{ background: c.bgTertiary, color: c.warning }}>npm run dev</code> in
              the terminal, then enter the URL above.
            </p>
            <p className="mt-3 text-xs" style={{ color: c.textMuted }}>
              The preview connects via NodePod&apos;s Service Worker bridge for real-time HMR.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
