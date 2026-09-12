'use client';

import { workspaceClient } from '@/lib/workspace-client';

const COLORS: Record<string, string> = {
  Claude: '#D85A30', 'GPT-4o': '#1D9E75', Gemini: '#534AB7', Copilot: '#185FA5',
  Codex: '#1D9E75', Cline: '#E06C75', 'Roo Code': '#E5C07B', 'Kilo Code': '#61AFEF',
};

export function AIActivity() {
  const conns = workspaceClient.getMcpConnections();

  return (
    <div className="flex h-full flex-col bg-ide-panel">
      <div className="flex h-9 shrink-0 items-center border-b border-ide-border px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ide-text-secondary">AI Activity</span>
      </div>

      {/* Agents */}
      <div className="border-b border-ide-border px-3 py-2">
        <p className="mb-2 text-[11px] font-medium text-ide-text-secondary">
          {conns.length > 0 ? `${conns.length} connection${conns.length !== 1 ? 's' : ''}` : 'No connections'}
        </p>
        {conns.length > 0 ? conns.map((c, i) => (
          <div key={i} className="flex items-center gap-2 py-1 text-xs">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: COLORS[c.agentName] || '#007acc' }} />
            <span className="text-ide-text">{c.agentName}</span>
            <span className={`ml-auto text-[10px] ${c.connected ? 'text-ide-success' : 'text-ide-text-muted'}`}>
              {c.connected ? 'active' : 'configured'}
            </span>
          </div>
        )) : (
          <p className="text-xs leading-relaxed text-ide-text-muted">No AI agents connected. Open Settings to add an MCP connection.</p>
        )}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="mb-3 text-[11px] font-medium text-ide-text-secondary">Recent Activity</p>
        {conns.length === 0 ? (
          <div className="rounded-md border border-ide-border bg-ide-bg p-3">
            <p className="mb-2 text-xs font-medium text-ide-text">How it works</p>
            <ol className="list-inside list-decimal space-y-1 text-xs leading-relaxed text-ide-text-secondary">
              <li>Open Settings → MCP Server tab</li>
              <li>Add your MCP server URL and token</li>
              <li>Connect your AI tool</li>
              <li>Watch activity appear here</li>
            </ol>
          </div>
        ) : conns.map((c, i) => (
          <div key={i} className="mb-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: COLORS[c.agentName] || '#007acc' }} />
              <span className="font-medium" style={{ color: COLORS[c.agentName] || '#007acc' }}>{c.agentName}</span>
              <span className="ml-auto text-[10px] text-ide-text-muted">just now</span>
            </div>
            <p className="ml-3 mt-0.5 text-ide-text-secondary">Connected to workspace</p>
          </div>
        ))}
      </div>

      {/* Supported */}
      <div className="border-t border-ide-border px-3 py-2">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-ide-text-muted">Supported</p>
        <div className="flex flex-wrap gap-1">
          {Object.entries(COLORS).map(([n, color]) => (
            <span key={n} className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: color + '20', color }}>{n}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
