import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Workspace } from '../types.js';

export function registerTerminalTools(
  server: McpServer,
  workspace: Workspace
): void {
  server.tool(
    'run_command',
    'Execute a shell command and return output',
    {
      command: z.string().describe('Shell command to run'),
      cwd: z.string().optional().describe('Working directory'),
      timeout: z
        .number()
        .optional()
        .describe('Timeout in milliseconds (default: 30000)'),
    },
    async ({ command, cwd, timeout }) => {
      const result = await workspace.exec(command, { cwd, timeout });
      const output = [result.stdout, result.stderr]
        .filter(Boolean)
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: output || `(command completed with exit code ${result.exitCode})`,
          },
        ],
      };
    }
  );

  server.tool(
    'run_command_background',
    'Start a long-running process in the background',
    {
      command: z.string().describe('Shell command to run'),
      cwd: z.string().optional().describe('Working directory'),
    },
    async ({ command, cwd }) => {
      const { pid } = await workspace.execBackground(command, { cwd });
      return {
        content: [
          {
            type: 'text',
            text: `Started background process (PID: ${pid}): ${command}`,
          },
        ],
      };
    }
  );

  server.tool(
    'kill_process',
    'Stop a background process',
    {
      pid: z.number().describe('Process ID to kill'),
    },
    async ({ pid }) => {
      await workspace.killProcess(pid);
      return {
        content: [{ type: 'text', text: `Killed process ${pid}` }],
      };
    }
  );

  server.tool(
    'list_processes',
    'List all running background processes',
    {},
    async () => {
      const processes = await workspace.listProcesses();
      if (processes.length === 0) {
        return {
          content: [{ type: 'text', text: 'No running processes.' }],
        };
      }

      const formatted = processes
        .map(
          (p) =>
            `PID ${p.pid}: ${p.command} [${p.running ? 'running' : 'stopped'}]`
        )
        .join('\n');

      return { content: [{ type: 'text', text: formatted }] };
    }
  );
}
