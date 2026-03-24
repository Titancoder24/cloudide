import type { Workspace } from '../types.js';
import { ErrorCollector } from '@llm-ide/error-collector';

/**
 * REST API adapter — exposes the same tools as HTTP endpoints
 * for clients that don't speak MCP (ChatGPT plugins, custom agents).
 *
 * Routes:
 *   POST /api/v1/{workspace_id}/tools/{tool_name}
 *   GET  /api/v1/{workspace_id}/tools
 */
export interface RestAdapterConfig {
  workspace: Workspace;
  errorCollector: ErrorCollector;
}

interface ToolHandler {
  (params: Record<string, unknown>): Promise<{ content: Array<{ type: string; text: string }> }>;
}

/**
 * Build a map of tool name → handler function for REST API routing.
 */
export function buildToolHandlers(
  config: RestAdapterConfig
): Map<string, ToolHandler> {
  const { workspace, errorCollector } = config;
  const handlers = new Map<string, ToolHandler>();

  // File operations
  handlers.set('read_file', async (params) => {
    const content = await workspace.readFile(params.path as string);
    return { content: [{ type: 'text', text: content }] };
  });

  handlers.set('write_file', async (params) => {
    await workspace.writeFile(params.path as string, params.content as string);
    return { content: [{ type: 'text', text: `Written to ${params.path}` }] };
  });

  handlers.set('run_command', async (params) => {
    const result = await workspace.exec(params.command as string, {
      cwd: params.cwd as string | undefined,
      timeout: params.timeout as number | undefined,
    });
    return {
      content: [
        { type: 'text', text: result.stdout + result.stderr },
      ],
    };
  });

  handlers.set('list_directory', async (params) => {
    const entries = await workspace.listDirectory(
      (params.path as string) || '.'
    );
    return {
      content: [
        { type: 'text', text: JSON.stringify(entries, null, 2) },
      ],
    };
  });

  handlers.set('get_errors', async (params) => {
    const errors = errorCollector.store.getAll({
      status: (params.status as 'open' | 'resolved' | 'all') || 'open',
    });
    return {
      content: [
        { type: 'text', text: JSON.stringify(errors, null, 2) },
      ],
    };
  });

  return handlers;
}
