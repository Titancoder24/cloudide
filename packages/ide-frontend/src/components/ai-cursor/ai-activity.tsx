'use client';

import { useTheme } from '@/lib/theme';
import { workspaceClient } from '@/lib/workspace-client';

const AGENT_COLORS: Record<string, string> = {
  Claude: '#D85A30',
  'GPT-4o': '#1D9E75',
  Gemini: '#534AB7',
  Copilot: '#185FA5',
  Codex: '#1D9E75',
  Cline: '#E06C75',
  'Roo Code': '#E5C07B',
  'Kilo Code': '#61AFEF',
};

export function AIActivity() {
  const { c } = useTheme();
  const connections = workspaceClient.getMcpConnections();

  return (
    <div className="flex h-full flex-col" style={{ background: c.bgSecondary }}>
      {/* Header */}
      <div className="flex h-9 flex-shrink-0 items-center px-3" style={{ borderBottom: `1px solid ${c.border}` }}>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: c.textSecondary }}>
          AI Activity
        </span>
      </div>

      {/* Connected agents */}
      <div className="border-b px-3 py-2" style={{ borderColor: c.border }}>
        <p className="mb-2 text-[11px] font-medium" style={{ color: c.textSecondary }}>
          {connections.length > 0 ? `${connections.length} connection${connections.length !== 1 ? 's' : ''}` : 'No connections'}
        </p>
        {connections.length > 0 ? (
          connections.map((conn, i) => (
            <div key={i} className="flex items-center gap-2 py-1 text-xs">
              <span
                className={`inline-block h-2 w-2 rounded-full ${conn.connected ? 'ai-cursor-active' : ''}`}
                style={{ background: AGENT_COLORS[conn.agentName] || c.accent }}
              />
              <span style={{ color: c.textPrimary }}>{conn.agentName}</span>
              <span className="ml-auto text-[10px]" style={{ color: conn.connected ? c.success : c.textMuted }}>
                {conn.connected ? 'active' : 'configured'}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
            No AI agents connected. Open Settings to add an MCP connection.
          </p>
        )}
      </div>

      {/* Activity feed placeholder */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="mb-3 text-[11px] font-medium" style={{ color: c.textSecondary }}>Recent Activity</p>

        {connections.length > 0 ? (
          <div className="space-y-2">
            {connections.map((conn, i) => (
              <div key={i} className="text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: AGENT_COLORS[conn.agentName] || c.accent }} />
                  <span className="font-medium" style={{ color: AGENT_COLORS[conn.agentName] || c.accent }}>{conn.agentName}</span>
                  <span className="ml-auto text-[10px]" style={{ color: c.textMuted }}>just now</span>
                </div>
                <p className="ml-3 mt-0.5" style={{ color: c.textSecondary }}>Connected to workspace</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md p-3" style={{ background: c.bgPrimary, border: `1px solid ${c.border}` }}>
            <p className="mb-2 text-xs font-medium" style={{ color: c.textPrimary }}>How it works</p>
            <ol className="list-inside list-decimal space-y-1 text-xs leading-relaxed" style={{ color: c.textSecondary }}>
              <li>Open Settings → MCP Server tab</li>
              <li>Add your MCP server URL and token</li>
              <li>Connect your AI tool (Claude, Cursor, etc.)</li>
              <li>Watch AI activity appear here in real-time</li>
            </ol>
          </div>
        )}
      </div>

      {/* Supported agents */}
      <div className="border-t px-3 py-2" style={{ borderColor: c.border }}>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: c.textMuted }}>Supported</p>
        <div className="flex flex-wrap gap-1">
          {Object.entries(AGENT_COLORS).map(([name, color]) => (
            <span key={name} className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: color + '20', color }}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
