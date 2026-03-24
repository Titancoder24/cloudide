import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Workspace } from '../types.js';
import { ErrorCollector } from '@llm-ide/error-collector';
import { registerFileTools } from './file-ops.js';
import { registerSearchTools } from './search.js';
import { registerTerminalTools } from './terminal.js';
import { registerNpmTools } from './npm.js';
import { registerScaffoldTools } from './scaffold.js';
import { registerContextTools } from './context.js';
import { registerErrorTools } from './errors.js';
import { registerGitTools } from './git.js';
import { registerPreviewTools } from './preview.js';
import { registerMetaTools } from './meta.js';

export interface ToolContext {
  workspace: Workspace;
  errorCollector: ErrorCollector;
}

/**
 * Register all MCP tools on the server.
 */
export function registerAllTools(
  server: McpServer,
  ctx: ToolContext
): void {
  registerFileTools(server, ctx.workspace);
  registerSearchTools(server, ctx.workspace);
  registerTerminalTools(server, ctx.workspace);
  registerNpmTools(server, ctx.workspace);
  registerScaffoldTools(server, ctx.workspace);
  registerContextTools(server, ctx.workspace);
  registerErrorTools(server, ctx.errorCollector);
  registerGitTools(server, ctx.workspace);
  registerPreviewTools(server, ctx.workspace);
  registerMetaTools(server);
}
