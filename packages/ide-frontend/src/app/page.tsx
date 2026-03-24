'use client';

import { useState } from 'react';
import { ThemeProvider } from '@/lib/theme';
import { IDELayout } from '@/components/layout/ide-layout';
import { NewProjectDialog } from '@/components/project/new-project-dialog';
import { workspaceClient, type ProjectTemplate } from '@/lib/workspace-client';

type Screen = 'welcome' | 'new-project' | 'ide';

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('welcome');

  const handleCreate = async (template: ProjectTemplate, name: string) => {
    await workspaceClient.createProject(template, name);
    setScreen('ide');
  };

  return (
    <ThemeProvider>
      {screen === 'welcome' && (
        <Welcome
          onNew={() => setScreen('new-project')}
          onDemo={async () => { await workspaceClient.createProject('react', 'my-app'); setScreen('ide'); }}
        />
      )}
      {screen === 'new-project' && (
        <NewProjectDialog onSubmit={handleCreate} onCancel={() => setScreen('welcome')} />
      )}
      {screen === 'ide' && <IDELayout onNewProject={() => setScreen('new-project')} />}
    </ThemeProvider>
  );
}

function Welcome({ onNew, onDemo }: { onNew: () => void; onDemo: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center bg-ide-bg">
      <div className="w-full max-w-lg px-6 text-center">
        {/* Logo */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-ide-accent">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white">LLM-IDE</h1>
        <p className="mb-8 text-sm text-ide-text-secondary">
          Cloud IDE for Node.js — connect any AI coding tool via MCP
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onNew}
            className="w-full rounded-lg bg-ide-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-ide-accent-hover"
          >
            New Project
          </button>
          <button
            onClick={onDemo}
            className="w-full rounded-lg border border-ide-border bg-ide-panel py-3 text-sm font-medium text-ide-text transition-colors hover:bg-ide-hover"
          >
            Open Demo Project
          </button>
        </div>

        {/* MCP snippet */}
        <div className="mt-8 rounded-lg border border-ide-border bg-ide-panel p-4 text-left">
          <p className="mb-2 text-xs font-semibold text-ide-text">Connect AI tools via MCP:</p>
          <pre className="overflow-x-auto rounded bg-ide-bg p-3 text-xs leading-relaxed text-ide-warning">
{`{
  "mcpServers": {
    "llm-ide": {
      "url": "wss://localhost:3002/mcp",
      "headers": {
        "Authorization": "Bearer tok_..."
      }
    }
  }
}`}
          </pre>
          <p className="mt-2 text-xs text-ide-text-muted">
            Works with Claude Code, Cursor, Cline, Windsurf, and any MCP client.
          </p>
        </div>
      </div>
    </div>
  );
}
