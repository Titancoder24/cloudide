'use client';

import { useState, useEffect } from 'react';

interface AIAgent {
  id: string;
  label: string;
  color: string;
  status: 'idle' | 'reading' | 'writing' | 'executing';
  file?: string;
  line?: number;
}

interface ActivityEntry {
  agentId: string;
  label: string;
  color: string;
  timestamp: string;
  action: string;
}

const DEMO_AGENTS: AIAgent[] = [
  {
    id: 'claude',
    label: 'Claude',
    color: '#D85A30',
    status: 'idle',
  },
  {
    id: 'chatgpt',
    label: 'GPT-4o',
    color: '#1D9E75',
    status: 'idle',
  },
];

/**
 * AI Activity Panel — shows real-time feed of connected AI agents
 * and their actions in the workspace.
 */
export function AIActivity() {
  const [agents] = useState<AIAgent[]>(DEMO_AGENTS);
  const [activities] = useState<ActivityEntry[]>([
    {
      agentId: 'claude',
      label: 'Claude',
      color: '#D85A30',
      timestamp: new Date().toISOString(),
      action: 'Connected to workspace',
    },
  ]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 items-center px-3 text-[11px] font-semibold uppercase tracking-wide text-[#858585]">
        AI Activity
      </div>

      {/* Connected agents */}
      <div className="border-b border-[#3e3e42] px-3 pb-2">
        <p className="mb-1.5 text-[11px] text-[#858585]">
          {agents.length} agent{agents.length !== 1 ? 's' : ''} connected
        </p>
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center gap-2 py-0.5 text-[12px]"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                agent.status !== 'idle' ? 'ai-cursor-active' : ''
              }`}
              style={{ backgroundColor: agent.color }}
            />
            <span className="text-[#cccccc]">{agent.label}</span>
            <span className="ml-auto text-[11px] text-[#858585]">
              {agent.status}
            </span>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {activities.length === 0 ? (
          <p className="text-[12px] text-[#858585]">
            No activity yet. Connect an AI tool via MCP to see its actions here.
          </p>
        ) : (
          activities.map((entry, i) => (
            <div key={i} className="mb-2 text-[12px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-medium" style={{ color: entry.color }}>
                  {entry.label}
                </span>
                <span className="ml-auto text-[10px] text-[#858585]">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="ml-3 text-[#cccccc]">{entry.action}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
