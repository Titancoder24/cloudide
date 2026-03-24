import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Workspace } from '../types.js';

export function registerPreviewTools(
  server: McpServer,
  workspace: Workspace
): void {
  server.tool(
    'get_preview_url',
    'Get the live preview URL for the running app',
    {
      port: z.number().optional().describe('Port number (default: 3000)'),
    },
    async ({ port }) => {
      const url = workspace.getPreviewUrl(port);
      return { content: [{ type: 'text', text: url }] };
    }
  );

  server.tool(
    'get_server_logs',
    'Read recent server output/logs',
    {
      lines: z.number().optional().describe('Number of lines (default: 50)'),
      since: z.string().optional().describe('ISO timestamp'),
    },
    async ({ lines, since }) => {
      const logs = await workspace.getServerLogs({ lines, since });
      return { content: [{ type: 'text', text: logs }] };
    }
  );
}
