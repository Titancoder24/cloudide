import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Meta-tools for dynamic tool loading and batch execution.
 * These reduce token overhead and round-trip latency.
 */

const TOOL_CATALOG = {
  file: [
    { name: 'read_file', description: 'Read file contents' },
    { name: 'write_file', description: 'Create or overwrite a file' },
    { name: 'edit_file', description: 'Surgical search/replace edits' },
    { name: 'delete_file', description: 'Delete file or directory' },
    { name: 'move_file', description: 'Move or rename' },
    { name: 'create_files_batch', description: 'Create multiple files' },
    { name: 'file_exists', description: 'Check if path exists' },
  ],
  search: [
    { name: 'list_directory', description: 'List directory contents' },
    { name: 'create_directory', description: 'Create a directory' },
    { name: 'directory_tree', description: 'Full tree structure' },
    { name: 'search_files', description: 'Grep across codebase' },
    { name: 'find_files', description: 'Find by name/glob' },
    { name: 'get_file_info', description: 'File metadata' },
  ],
  terminal: [
    { name: 'run_command', description: 'Execute shell command' },
    { name: 'run_command_background', description: 'Start background process' },
    { name: 'kill_process', description: 'Stop background process' },
    { name: 'list_processes', description: 'List running processes' },
  ],
  npm: [
    { name: 'npm_install', description: 'Install packages' },
    { name: 'npm_run', description: 'Run package.json script' },
    { name: 'list_packages', description: 'List dependencies' },
    { name: 'check_package_compatibility', description: 'Check browser runtime compatibility' },
  ],
  scaffold: [
    { name: 'scaffold_project', description: 'Generate from template' },
  ],
  context: [
    { name: 'get_codebase_context', description: 'Pack codebase for LLM' },
    { name: 'get_file_context', description: 'File + its imports/dependents' },
    { name: 'get_project_summary', description: 'High-level overview' },
  ],
  errors: [
    { name: 'get_errors', description: 'Get collected errors' },
    { name: 'get_error_detail', description: 'Full error detail' },
    { name: 'resolve_error', description: 'Mark error as fixed' },
    { name: 'clear_errors', description: 'Clear resolved errors' },
    { name: 'get_error_summary', description: 'Quick overview' },
  ],
  git: [
    { name: 'git_status', description: 'Current git status' },
    { name: 'git_commit', description: 'Stage and commit' },
    { name: 'git_diff', description: 'Show changes' },
  ],
  preview: [
    { name: 'get_preview_url', description: 'Live preview URL' },
    { name: 'get_server_logs', description: 'Read server output' },
  ],
};

export function registerMetaTools(server: McpServer): void {
  server.tool(
    'discover_tools',
    'List available tools (lightweight — use this to find tools before calling them)',
    {
      category: z
        .enum([
          'file', 'search', 'terminal', 'npm', 'scaffold',
          'context', 'errors', 'git', 'preview', 'all',
        ])
        .optional()
        .describe('Tool category (default: all)'),
    },
    async ({ category }) => {
      if (category && category !== 'all') {
        const tools = TOOL_CATALOG[category as keyof typeof TOOL_CATALOG];
        return {
          content: [
            { type: 'text', text: JSON.stringify(tools, null, 2) },
          ],
        };
      }

      return {
        content: [
          { type: 'text', text: JSON.stringify(TOOL_CATALOG, null, 2) },
        ],
      };
    }
  );
}
