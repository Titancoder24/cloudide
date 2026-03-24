'use client';

import { useState } from 'react';

/**
 * Live preview panel — shows the running app in an iframe.
 * In production, this connects to NodePod's Service Worker bridge
 * for real-time preview with HMR.
 */
export function PreviewPanel() {
  const [url, setUrl] = useState('about:blank');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      {/* Preview toolbar */}
      <div className="flex h-8 items-center gap-2 border-b border-[#3e3e42] px-2 text-[11px]">
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="text-[#858585] hover:text-white"
          title="Refresh"
        >
          ↻
        </button>
        <input
          className="flex-1 rounded bg-[#3c3c3c] px-2 py-0.5 text-[12px] text-[#cccccc] outline-none"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://localhost:3000"
        />
      </div>

      {/* Preview iframe */}
      <div className="flex flex-1 items-center justify-center">
        {url === 'about:blank' ? (
          <div className="text-center text-[#858585]">
            <p className="mb-2 text-sm">No preview available</p>
            <p className="text-xs">
              Run <code className="text-[#ce9178]">npm run dev</code> to start
              the dev server, then the preview will appear here.
            </p>
          </div>
        ) : (
          <iframe
            key={refreshKey}
            src={url}
            className="h-full w-full border-none bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title="Preview"
          />
        )}
      </div>
    </div>
  );
}
