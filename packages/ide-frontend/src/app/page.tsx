'use client';

import { useState } from 'react';
import { IDELayout } from '@/components/layout/ide-layout';

export default function HomePage() {
  const [started, setStarted] = useState(false);

  if (started) {
    return <IDELayout />;
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="mb-2 text-3xl font-bold text-white">LLM-IDE</h1>
        <p className="mb-6 text-[#858585]">
          Cloud IDE for the Node.js ecosystem. Connect any AI tool via MCP.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="rounded-md bg-[#007acc] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a8ad4]"
        >
          Open IDE
        </button>
        <div className="mt-8 text-left text-xs text-[#858585]">
          <p className="mb-2 font-medium text-[#cccccc]">
            Connect your AI tool:
          </p>
          <pre className="rounded bg-[#252526] p-3 text-[#ce9178]">
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
        </div>
      </div>
    </div>
  );
}
