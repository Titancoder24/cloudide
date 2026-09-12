'use client';

import { useState } from 'react';

export function PreviewPanel() {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState(0);

  return (
    <div className="flex h-full flex-col bg-ide-panel">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-ide-border px-2">
        <button onClick={() => setKey(k => k + 1)} className="flex h-6 w-6 items-center justify-center rounded text-sm text-ide-text-secondary hover:text-ide-text" title="Refresh">↻</button>
        <input
          className="flex-1 rounded border border-ide-border bg-ide-input px-2 py-1 text-xs text-ide-text outline-none focus:border-ide-accent"
          value={url} onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setKey(k => k + 1)}
          placeholder="http://localhost:3000" spellCheck={false}
        />
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {url ? (
          <iframe key={key} src={url} className="h-full w-full border-none bg-white" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" title="Preview" />
        ) : (
          <div className="p-6 text-center">
            <div className="mb-3 text-2xl opacity-20">🌐</div>
            <p className="mb-2 text-sm text-ide-text-secondary">No preview available</p>
            <p className="text-xs leading-relaxed text-ide-text-muted">
              Run <code className="rounded bg-ide-bg px-1 py-0.5 text-ide-warning">npm run dev</code> in the terminal, then enter the URL above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
