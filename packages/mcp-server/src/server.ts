import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ErrorCollector } from '@llm-ide/error-collector';
import { registerAllTools } from './tools/index.js';
import { FilesystemWorkspace } from './workspace-fs.js';
import type { Workspace } from './types.js';

export interface ServerOptions {
  workspacePath: string;
  name?: string;
  version?: string;
}

/**
 * Create and configure the MCP server with all tools registered.
 */
export function createMcpServer(options: ServerOptions): {
  server: McpServer;
  workspace: Workspace;
  errorCollector: ErrorCollector;
} {
  const { workspacePath, name = 'llm-ide', version = '0.1.0' } = options;

  // Create MCP server
  const server = new McpServer({ name, version });

  // Create workspace abstraction
  const workspace = new FilesystemWorkspace(workspacePath);

  // Create error collector
  const errorCollector = new ErrorCollector();

  // Register all tools
  registerAllTools(server, { workspace, errorCollector });

  return { server, workspace, errorCollector };
}
