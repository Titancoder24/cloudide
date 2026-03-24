'use client';

import { useState } from 'react';
import { useTheme, themes } from '@/lib/theme';
import { workspaceClient, type McpConnectionConfig } from '@/lib/workspace-client';

interface Props {
  onClose: () => void;
}

type Tab = 'theme' | 'mcp' | 'about';

export function SettingsPanel({ onClose }: Props) {
  const { c, theme, setThemeId } = useTheme();
  const [tab, setTab] = useState<Tab>('mcp');
  const [connections, setConnections] = useState<McpConnectionConfig[]>(workspaceClient.getMcpConnections());

  // MCP form
  const [mcpUrl, setMcpUrl] = useState('wss://localhost:3002/mcp');
  const [mcpToken, setMcpToken] = useState('');
  const [mcpAgent, setMcpAgent] = useState('Claude');

  const addConnection = () => {
    if (!mcpUrl.trim()) return;
    const conn: McpConnectionConfig = {
      url: mcpUrl.trim(),
      token: mcpToken.trim(),
      connected: false,
      agentName: mcpAgent.trim() || 'Agent',
    };
    workspaceClient.addMcpConnection(conn);
    setConnections(workspaceClient.getMcpConnections());
    setMcpUrl('wss://localhost:3002/mcp');
    setMcpToken('');
    setMcpAgent('Claude');
  };

  const removeConnection = (idx: number) => {
    workspaceClient.removeMcpConnection(idx);
    setConnections(workspaceClient.getMcpConnections());
  };

  const tabStyle = (t: Tab) => ({
    background: tab === t ? c.accent : 'transparent',
    color: tab === t ? '#fff' : c.textSecondary,
  });

  const inputStyle = {
    background: c.bgInput,
    border: `1px solid ${c.border}`,
    color: c.textPrimary,
  };

  return (
    <div className="flex h-full flex-col" style={{ background: c.bgSecondary }}>
      {/* Header */}
      <div className="flex h-10 items-center justify-between border-b px-3" style={{ borderColor: c.border }}>
        <span className="text-xs font-semibold" style={{ color: c.textPrimary }}>Settings</span>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded text-sm"
          style={{ color: c.textSecondary }}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b px-3 py-1.5" style={{ borderColor: c.border }}>
        {([['mcp', 'MCP Server'], ['theme', 'Themes'], ['about', 'About']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="rounded px-2.5 py-1 text-xs font-medium transition-colors"
            style={tabStyle(t)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'mcp' && (
          <div>
            <p className="mb-3 text-xs leading-relaxed" style={{ color: c.textSecondary }}>
              Connect AI coding tools to this workspace. Add your MCP server URL and token below.
              Any MCP-compatible client (Claude Code, Cursor, Cline, Windsurf) can connect.
            </p>

            {/* Existing connections */}
            {connections.length > 0 && (
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium" style={{ color: c.textSecondary }}>Active Connections</label>
                {connections.map((conn, i) => (
                  <div
                    key={i}
                    className="mb-1.5 flex items-center justify-between rounded-md px-3 py-2"
                    style={{ background: c.bgPrimary, border: `1px solid ${c.border}` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${conn.connected ? '' : ''}`}
                        style={{ background: conn.connected ? c.success : c.warning }}
                      />
                      <div>
                        <span className="text-xs font-medium" style={{ color: c.textPrimary }}>{conn.agentName}</span>
                        <span className="ml-2 text-xs" style={{ color: c.textMuted }}>{conn.url}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeConnection(i)}
                      className="text-xs"
                      style={{ color: c.error }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new */}
            <div className="space-y-2">
              <label className="block text-xs font-medium" style={{ color: c.textSecondary }}>Add Connection</label>
              <input
                value={mcpAgent}
                onChange={(e) => setMcpAgent(e.target.value)}
                className="w-full rounded-md px-3 py-1.5 text-xs outline-none"
                style={inputStyle}
                placeholder="Agent name (e.g., Claude)"
              />
              <input
                value={mcpUrl}
                onChange={(e) => setMcpUrl(e.target.value)}
                className="w-full rounded-md px-3 py-1.5 text-xs outline-none"
                style={inputStyle}
                placeholder="MCP Server URL"
              />
              <input
                value={mcpToken}
                onChange={(e) => setMcpToken(e.target.value)}
                className="w-full rounded-md px-3 py-1.5 text-xs outline-none"
                style={inputStyle}
                placeholder="API Token (optional)"
                type="password"
              />
              <button
                onClick={addConnection}
                className="w-full rounded-md px-3 py-1.5 text-xs font-medium text-white"
                style={{ background: c.accent }}
              >
                Add Connection
              </button>
            </div>

            {/* Config snippet */}
            <div className="mt-4 rounded-md p-3" style={{ background: c.bgPrimary, border: `1px solid ${c.border}` }}>
              <p className="mb-1.5 text-xs font-medium" style={{ color: c.textSecondary }}>
                For AI tools, add this to MCP settings:
              </p>
              <pre className="overflow-x-auto text-[11px] leading-relaxed" style={{ color: c.warning }}>
{`{
  "mcpServers": {
    "llm-ide": {
      "url": "${mcpUrl}",
      "headers": {
        "Authorization": "Bearer ${mcpToken || 'tok_...'}"
      }
    }
  }
}`}
              </pre>
            </div>
          </div>
        )}

        {tab === 'theme' && (
          <div>
            <p className="mb-3 text-xs" style={{ color: c.textSecondary }}>Choose your editor theme.</p>
            <div className="space-y-1.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors"
                  style={{
                    background: theme.id === t.id ? c.accentMuted : c.bgPrimary,
                    border: `1px solid ${theme.id === t.id ? c.accent : c.border}`,
                  }}
                >
                  {/* Color preview dots */}
                  <div className="flex gap-1">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ background: t.colors.bgPrimary, border: '1px solid #555' }} />
                    <span className="inline-block h-3 w-3 rounded-full" style={{ background: t.colors.accent }} />
                    <span className="inline-block h-3 w-3 rounded-full" style={{ background: t.colors.success }} />
                    <span className="inline-block h-3 w-3 rounded-full" style={{ background: t.colors.error }} />
                  </div>
                  <div>
                    <span className="text-sm font-medium" style={{ color: c.textPrimary }}>{t.name}</span>
                    {theme.id === t.id && (
                      <span className="ml-2 text-xs" style={{ color: c.accent }}>Active</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'about' && (
          <div className="text-xs leading-relaxed" style={{ color: c.textSecondary }}>
            <h3 className="mb-2 font-semibold" style={{ color: c.textPrimary }}>LLM-IDE v0.1.0</h3>
            <p className="mb-3">
              A cloud-based IDE built for the Node.js ecosystem that acts as a universal
              backend for every AI coding tool. Any LLM provider, any AI IDE, any coding
              agent connects via MCP.
            </p>
            <h4 className="mb-1 font-semibold" style={{ color: c.textPrimary }}>Supported Clients</h4>
            <ul className="mb-3 ml-3 list-disc space-y-0.5">
              <li>Claude Code, Claude Desktop</li>
              <li>Cursor, Windsurf, Trae</li>
              <li>Cline, Roo Code, Kilo Code</li>
              <li>GitHub Copilot, OpenAI Codex CLI</li>
              <li>Gemini CLI, Google Antigravity</li>
              <li>Any MCP-compatible client</li>
            </ul>
            <h4 className="mb-1 font-semibold" style={{ color: c.textPrimary }}>Tech Stack</h4>
            <p>NodePod runtime, MCP SDK, Hono gateway, Next.js, Monaco Editor</p>
          </div>
        )}
      </div>
    </div>
  );
}
