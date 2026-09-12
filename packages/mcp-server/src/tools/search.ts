import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Workspace } from '../types.js';

export function registerSearchTools(
  server: McpServer,
  workspace: Workspace
): void {
  server.tool(
    'list_directory',
    'List directory contents with metadata',
    {
      path: z.string().describe('Directory path').default('.'),
      recursive: z.boolean().optional().describe('List recursively'),
      include_hidden: z.boolean().optional().describe('Include hidden files'),
    },
    async ({ path: dirPath, recursive, include_hidden }) => {
      const entries = await workspace.listDirectory(dirPath, {
        recursive,
        includeHidden: include_hidden,
      });
      const formatted = entries
        .map((e) => {
          const icon = e.type === 'directory' ? '📁' : '📄';
          const size = e.size ? ` (${formatSize(e.size)})` : '';
          return `${icon} ${e.path}${size}`;
        })
        .join('\n');
      return { content: [{ type: 'text', text: formatted || '(empty directory)' }] };
    }
  );

  server.tool(
    'create_directory',
    'Create a directory (mkdir -p)',
    {
      path: z.string().describe('Directory path to create'),
    },
    async ({ path: dirPath }) => {
      await workspace.writeFile(`${dirPath}/.gitkeep`, '');
      await workspace.deleteFile(`${dirPath}/.gitkeep`);
      return { content: [{ type: 'text', text: `Created directory ${dirPath}` }] };
    }
  );

  server.tool(
    'directory_tree',
    'Get full directory tree structure',
    {
      path: z.string().describe('Root path for tree').default('.'),
      depth: z.number().optional().describe('Max depth (default: 4)'),
      ignore_patterns: z
        .array(z.string())
        .optional()
        .describe('Patterns to ignore'),
    },
    async ({ path: dirPath, depth, ignore_patterns }) => {
      const tree = await workspace.directoryTree(dirPath, {
        depth,
        ignorePatterns: ignore_patterns,
      });
      return { content: [{ type: 'text', text: tree }] };
    }
  );

  server.tool(
    'search_files',
    'Search for text pattern across the codebase',
    {
      pattern: z.string().describe('Search pattern'),
      path: z.string().optional().describe('Directory to search in'),
      regex: z.boolean().optional().describe('Treat pattern as regex'),
      include: z.array(z.string()).optional().describe('File globs to include'),
      exclude: z.array(z.string()).optional().describe('File globs to exclude'),
    },
    async ({ pattern, path: searchPath, regex, include, exclude }) => {
      const results = await workspace.searchFiles(pattern, {
        path: searchPath,
        regex,
        include,
        exclude,
      });

      if (results.length === 0) {
        return { content: [{ type: 'text', text: 'No matches found.' }] };
      }

      const formatted = results
        .map(
          (r) =>
            `${r.file}:${r.line}:${r.column} — ${r.context}`
        )
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `${results.length} match(es):\n${formatted}`,
          },
        ],
      };
    }
  );

  server.tool(
    'find_files',
    'Find files by name or glob pattern',
    {
      pattern: z.string().describe('Name or glob pattern'),
      path: z.string().optional().describe('Search directory'),
    },
    async ({ pattern, path: searchPath }) => {
      const files = await workspace.findFiles(pattern, searchPath);
      return {
        content: [
          {
            type: 'text',
            text:
              files.length > 0
                ? files.join('\n')
                : 'No files found.',
          },
        ],
      };
    }
  );

  server.tool(
    'get_file_info',
    'Get file metadata (size, dates)',
    {
      path: z.string().describe('File path'),
    },
    async ({ path: filePath }) => {
      const info = await workspace.getFileInfo(filePath);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    }
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
