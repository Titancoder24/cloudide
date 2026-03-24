#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './server.js';
import * as path from 'node:path';

const workspacePath =
  process.env.WORKSPACE_PATH || process.argv[2] || process.cwd();

console.error(`LLM-IDE MCP Server starting...`);
console.error(`Workspace: ${path.resolve(workspacePath)}`);

const { server } = createMcpServer({ workspacePath });

// Use stdio transport for local development and CLI usage
const transport = new StdioServerTransport();

async function main(): Promise<void> {
  await server.connect(transport);
  console.error('MCP server connected via stdio.');
}

main().catch((err) => {
  console.error('Failed to start MCP server:', err);
  process.exit(1);
});
