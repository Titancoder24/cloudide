import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Workspace } from '../types.js';

export function registerFileTools(
  server: McpServer,
  workspace: Workspace
): void {
  server.tool(
    'read_file',
    'Read file contents',
    {
      path: z.string().describe('File path relative to workspace root'),
      encoding: z.string().optional().describe('File encoding (default: utf-8)'),
      line_start: z.number().optional().describe('Starting line number'),
      line_end: z.number().optional().describe('Ending line number'),
    },
    async ({ path: filePath, encoding, line_start, line_end }) => {
      let content = await workspace.readFile(filePath, encoding);
      if (line_start !== undefined || line_end !== undefined) {
        const lines = content.split('\n');
        const start = (line_start || 1) - 1;
        const end = line_end || lines.length;
        content = lines.slice(start, end).join('\n');
      }
      return { content: [{ type: 'text', text: content }] };
    }
  );

  server.tool(
    'write_file',
    'Create or overwrite a file',
    {
      path: z.string().describe('File path to write'),
      content: z.string().describe('File contents'),
    },
    async ({ path: filePath, content }) => {
      await workspace.writeFile(filePath, content);
      return { content: [{ type: 'text', text: `Written to ${filePath}` }] };
    }
  );

  server.tool(
    'edit_file',
    'Apply surgical search/replace edits to a file',
    {
      path: z.string().describe('File path to edit'),
      edits: z.array(
        z.object({
          old_str: z.string().describe('String to find'),
          new_str: z.string().describe('String to replace with'),
        })
      ),
    },
    async ({ path: filePath, edits }) => {
      let content = await workspace.readFile(filePath);
      const applied: string[] = [];
      const failed: string[] = [];

      for (const edit of edits) {
        if (content.includes(edit.old_str)) {
          content = content.replace(edit.old_str, edit.new_str);
          applied.push(edit.old_str.slice(0, 50));
        } else {
          // Fuzzy match: try trimmed whitespace
          const trimmedOld = edit.old_str.trim();
          const lines = content.split('\n');
          let found = false;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === trimmedOld) {
              const indent = lines[i].match(/^\s*/)?.[0] || '';
              lines[i] = indent + edit.new_str.trim();
              found = true;
              break;
            }
          }
          if (found) {
            content = lines.join('\n');
            applied.push(`(fuzzy) ${edit.old_str.slice(0, 50)}`);
          } else {
            failed.push(edit.old_str.slice(0, 50));
          }
        }
      }

      await workspace.writeFile(filePath, content);

      let msg = `Applied ${applied.length} edit(s) to ${filePath}`;
      if (failed.length > 0) {
        msg += `\nFailed to match: ${failed.join(', ')}`;
      }
      return { content: [{ type: 'text', text: msg }] };
    }
  );

  server.tool(
    'delete_file',
    'Delete a file or directory',
    {
      path: z.string().describe('Path to delete'),
      recursive: z.boolean().optional().describe('Recursively delete directories'),
    },
    async ({ path: filePath, recursive }) => {
      await workspace.deleteFile(filePath, recursive);
      return {
        content: [{ type: 'text', text: `Deleted ${filePath}` }],
      };
    }
  );

  server.tool(
    'move_file',
    'Move or rename a file',
    {
      source: z.string().describe('Source path'),
      destination: z.string().describe('Destination path'),
    },
    async ({ source, destination }) => {
      await workspace.moveFile(source, destination);
      return {
        content: [
          { type: 'text', text: `Moved ${source} → ${destination}` },
        ],
      };
    }
  );

  server.tool(
    'create_files_batch',
    'Create multiple files at once',
    {
      files: z.array(
        z.object({
          path: z.string(),
          content: z.string(),
        })
      ),
    },
    async ({ files }) => {
      for (const file of files) {
        await workspace.writeFile(file.path, file.content);
      }
      return {
        content: [
          {
            type: 'text',
            text: `Created ${files.length} files:\n${files.map((f) => `  ${f.path}`).join('\n')}`,
          },
        ],
      };
    }
  );

  server.tool(
    'file_exists',
    'Check if a path exists',
    {
      path: z.string().describe('Path to check'),
    },
    async ({ path: filePath }) => {
      const exists = await workspace.fileExists(filePath);
      return {
        content: [
          { type: 'text', text: exists ? 'true' : 'false' },
        ],
      };
    }
  );
}
