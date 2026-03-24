'use client';

import { useState } from 'react';
import { ThemeProvider } from '@/lib/theme';
import { IDELayout } from '@/components/layout/ide-layout';
import { NewProjectDialog } from '@/components/project/new-project-dialog';
import { workspaceClient, type ProjectTemplate } from '@/lib/workspace-client';

type Screen = 'welcome' | 'new-project' | 'ide';

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('welcome');

  const handleCreateProject = async (template: ProjectTemplate, name: string) => {
    await workspaceClient.createProject(template, name);
    setScreen('ide');
  };

  const handleOpenDemo = async () => {
    await workspaceClient.createProject('react', 'my-app');
    setScreen('ide');
  };

  return (
    <ThemeProvider>
      {screen === 'welcome' && (
        <WelcomeScreen
          onNewProject={() => setScreen('new-project')}
          onOpenDemo={handleOpenDemo}
        />
      )}
      {screen === 'new-project' && (
        <NewProjectDialog
          onSubmit={handleCreateProject}
          onCancel={() => setScreen('welcome')}
        />
      )}
      {screen === 'ide' && <IDELayout onNewProject={() => setScreen('new-project')} />}
    </ThemeProvider>
  );
}

function WelcomeScreen({
  onNewProject,
  onOpenDemo,
}: {
  onNewProject: () => void;
  onOpenDemo: () => void;
}) {
  return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-primary, #1e1e1e)' }}>
      <div className="w-full max-w-lg px-6 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#007acc' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold" style={{ color: '#ffffff' }}>LLM-IDE</h1>
          <p className="text-sm" style={{ color: '#858585' }}>
            Cloud IDE for Node.js — connect any AI tool via MCP
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-3">
          <button
            onClick={onNewProject}
            className="w-full rounded-lg px-5 py-3 text-sm font-medium text-white transition-colors"
            style={{ background: '#007acc' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1a8ad4')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#007acc')}
          >
            New Project
          </button>
          <button
            onClick={onOpenDemo}
            className="w-full rounded-lg px-5 py-3 text-sm font-medium transition-colors"
            style={{ background: '#2d2d2d', color: '#cccccc', border: '1px solid #3e3e42' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#3c3c3c')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2d2d2d')}
          >
            Open Demo Project
          </button>
        </div>

        <div className="rounded-lg p-4 text-left" style={{ background: '#252526', border: '1px solid #3e3e42' }}>
          <p className="mb-2 text-xs font-semibold" style={{ color: '#cccccc' }}>Connect AI tools via MCP:</p>
          <pre className="overflow-x-auto rounded p-3 text-xs leading-relaxed" style={{ background: '#1e1e1e', color: '#ce9178' }}>
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
          <p className="mt-2 text-xs" style={{ color: '#858585' }}>
            Works with Claude Code, Cursor, Cline, Windsurf, and any MCP client.
          </p>
        </div>
      </div>
    </div>
  );
}
