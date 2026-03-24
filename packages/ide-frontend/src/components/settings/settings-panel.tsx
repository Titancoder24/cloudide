'use client';

import { useState } from 'react';
import { useTheme, themes } from '@/lib/theme';
import { workspaceClient, type McpConnectionConfig } from '@/lib/workspace-client';

type Tab = 'mcp' | 'theme' | 'about';

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { theme, setThemeId } = useTheme();
  const [tab, setTab] = useState<Tab>('mcp');
  const [conns, setConns] = useState(workspaceClient.getMcpConnections());
  const [mcpUrl, setMcpUrl] = useState('wss://localhost:3002/mcp');
  const [mcpToken, setMcpToken] = useState('');
  const [mcpAgent, setMcpAgent] = useState('Claude');

  const addConn = () => {
    if (!mcpUrl.trim()) return;
    workspaceClient.addMcpConnection({ url: mcpUrl.trim(), token: mcpToken.trim(), connected: false, agentName: mcpAgent.trim() || 'Agent' });
    setConns(workspaceClient.getMcpConnections());
    setMcpUrl('wss://localhost:3002/mcp'); setMcpToken(''); setMcpAgent('Claude');
  };

  const removeConn = (i: number) => { workspaceClient.removeMcpConnection(i); setConns(workspaceClient.getMcpConnections()); };

  return (
    <div className="flex h-full flex-col bg-ide-panel">
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-ide-border px-3">
        <span className="text-xs font-semibold text-ide-text">Settings</span>
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded text-sm text-ide-text-secondary hover:text-ide-text">×</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ide-border px-3 py-1.5">
        {(['mcp', 'theme', 'about'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors ${tab === t ? 'bg-ide-accent text-white' : 'text-ide-text-secondary hover:text-ide-text'}`}
          >{t === 'mcp' ? 'MCP Server' : t}</button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* MCP Tab */}
        {tab === 'mcp' && (
          <div>
            <p className="mb-3 text-xs leading-relaxed text-ide-text-secondary">
              Connect AI coding tools to this workspace. Add your MCP server URL and token below.
            </p>

            {conns.length > 0 && (
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-ide-text-secondary">Active Connections</label>
                {conns.map((c, i) => (
                  <div key={i} className="mb-1.5 flex items-center justify-between rounded-md border border-ide-border bg-ide-bg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: c.connected ? 'var(--color-ide-success)' : 'var(--color-ide-warning)' }} />
                      <span className="text-xs font-medium text-ide-text">{c.agentName}</span>
                      <span className="text-xs text-ide-text-muted">{c.url}</span>
                    </div>
                    <button onClick={() => removeConn(i)} className="text-xs text-ide-error hover:underline">Remove</button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-medium text-ide-text-secondary">Add Connection</label>
              <input value={mcpAgent} onChange={(e) => setMcpAgent(e.target.value)} className="w-full rounded-md border border-ide-border bg-ide-input px-3 py-1.5 text-xs text-ide-text outline-none focus:border-ide-accent" placeholder="Agent name (e.g., Claude)" />
              <input value={mcpUrl} onChange={(e) => setMcpUrl(e.target.value)} className="w-full rounded-md border border-ide-border bg-ide-input px-3 py-1.5 text-xs text-ide-text outline-none focus:border-ide-accent" placeholder="MCP Server URL" />
              <input value={mcpToken} onChange={(e) => setMcpToken(e.target.value)} className="w-full rounded-md border border-ide-border bg-ide-input px-3 py-1.5 text-xs text-ide-text outline-none focus:border-ide-accent" placeholder="API Token (optional)" type="password" />
              <button onClick={addConn} className="w-full rounded-md bg-ide-accent py-1.5 text-xs font-medium text-white hover:bg-ide-accent-hover">Add Connection</button>
            </div>

            <div className="mt-4 rounded-md border border-ide-border bg-ide-bg p-3">
              <p className="mb-1.5 text-xs font-medium text-ide-text-secondary">For AI tools, add this to MCP settings:</p>
              <pre className="overflow-x-auto text-[11px] leading-relaxed text-ide-warning">
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

        {/* Theme Tab */}
        {tab === 'theme' && (
          <div>
            <p className="mb-3 text-xs text-ide-text-secondary">Choose your editor theme.</p>
            <div className="space-y-1.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                    theme.id === t.id ? 'border-ide-accent bg-ide-accent-muted' : 'border-ide-border bg-ide-bg hover:bg-ide-hover'
                  }`}
                >
                  <span className="text-sm font-medium text-ide-text">{t.name}</span>
                  {theme.id === t.id && <span className="ml-auto text-xs text-ide-accent">Active</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* About Tab */}
        {tab === 'about' && (
          <div className="text-xs leading-relaxed text-ide-text-secondary">
            <h3 className="mb-2 font-semibold text-ide-text">LLM-IDE v0.1.0</h3>
            <p className="mb-3">
              Cloud-based IDE for the Node.js ecosystem. Universal backend for every AI coding tool via MCP.
            </p>
            <h4 className="mb-1 font-semibold text-ide-text">Supported Clients</h4>
            <ul className="mb-3 ml-3 list-disc space-y-0.5">
              <li>Claude Code, Claude Desktop</li>
              <li>Cursor, Windsurf, Trae</li>
              <li>Cline, Roo Code, Kilo Code</li>
              <li>GitHub Copilot, OpenAI Codex CLI</li>
              <li>Gemini CLI, Google Antigravity</li>
            </ul>
            <h4 className="mb-1 font-semibold text-ide-text">Tech Stack</h4>
            <p>NodePod, MCP SDK, Hono, Next.js, Monaco Editor</p>
          </div>
        )}
      </div>
    </div>
  );
}
