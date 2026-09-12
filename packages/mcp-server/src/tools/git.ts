import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Workspace } from '../types.js';

export function registerGitTools(
  server: McpServer,
  workspace: Workspace
): void {
  server.tool(
    'git_status',
    'Show current git status',
    {},
    async () => {
      const result = await workspace.exec('git status --porcelain');
      if (!result.stdout.trim()) {
        return {
          content: [{ type: 'text', text: 'Working directory clean.' }],
        };
      }
      return { content: [{ type: 'text', text: result.stdout }] };
    }
  );

  server.tool(
    'git_commit',
    'Stage files and create a commit',
    {
      message: z.string().describe('Commit message'),
      files: z
        .array(z.string())
        .optional()
        .describe('Files to stage (default: all changes)'),
    },
    async ({ message, files }) => {
      // Stage files
      if (files && files.length > 0) {
        await workspace.exec(`git add ${files.join(' ')}`);
      } else {
        await workspace.exec('git add -A');
      }

      // Commit
      const result = await workspace.exec(
        `git commit -m "${message.replace(/"/g, '\\"')}"`
      );
      return {
        content: [
          {
            type: 'text',
            text: result.stdout || result.stderr || 'Committed.',
          },
        ],
      };
    }
  );

  server.tool(
    'git_diff',
    'Show git diff',
    {
      file: z.string().optional().describe('Specific file to diff'),
    },
    async ({ file }) => {
      const cmd = file ? `git diff ${file}` : 'git diff';
      const result = await workspace.exec(cmd);
      return {
        content: [
          {
            type: 'text',
            text: result.stdout || 'No changes.',
          },
        ],
      };
    }
  );
}
