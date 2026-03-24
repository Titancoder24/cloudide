import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  ErrorCollector,
  type ErrorFilter,
} from '@llm-ide/error-collector';

/**
 * Error collection MCP tools — expose the error collector to LLMs.
 * This enables the "fix all my errors" workflow.
 */
export function registerErrorTools(
  server: McpServer,
  collector: ErrorCollector
): void {
  server.tool(
    'get_errors',
    'Get all collected errors from the workspace',
    {
      status: z
        .enum(['open', 'resolved', 'all'])
        .optional()
        .describe('Filter by status (default: open)'),
      severity: z
        .enum(['error', 'warning', 'info'])
        .optional()
        .describe('Filter by severity'),
      since: z.string().optional().describe('ISO timestamp — only errors after this time'),
      file: z.string().optional().describe('Filter by file path'),
    },
    async ({ status, severity, since, file }) => {
      const filter: ErrorFilter = {};
      if (status) filter.status = status;
      if (severity) filter.severity = severity;
      if (since) filter.since = since;
      if (file) filter.file = file;

      const errors = collector.store.getAll(filter);

      if (errors.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: status === 'all'
                ? 'No errors recorded.'
                : `No ${status || 'open'} errors.`,
            },
          ],
        };
      }

      return {
        content: [
          { type: 'text', text: JSON.stringify(errors, null, 2) },
        ],
      };
    }
  );

  server.tool(
    'get_error_detail',
    'Get full detail for a specific error',
    {
      error_id: z.string().describe('Error ID (e.g., err_001)'),
    },
    async ({ error_id }) => {
      const error = collector.store.get(error_id);
      if (!error) {
        return {
          content: [
            { type: 'text', text: `Error ${error_id} not found.` },
          ],
        };
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify(error, null, 2) },
        ],
      };
    }
  );

  server.tool(
    'resolve_error',
    'Mark an error as resolved',
    {
      error_id: z.string().describe('Error ID to resolve'),
    },
    async ({ error_id }) => {
      const success = collector.store.resolve(error_id, 'manual');
      return {
        content: [
          {
            type: 'text',
            text: success
              ? `Resolved ${error_id}.`
              : `Error ${error_id} not found.`,
          },
        ],
      };
    }
  );

  server.tool(
    'clear_errors',
    'Clear all resolved errors',
    {},
    async () => {
      const cleared = collector.store.clearResolved();
      return {
        content: [
          {
            type: 'text',
            text: `Cleared ${cleared} resolved error(s).`,
          },
        ],
      };
    }
  );

  server.tool(
    'get_error_summary',
    'Quick summary of errors for LLM consumption',
    {},
    async () => {
      return {
        content: [{ type: 'text', text: collector.getSummary() }],
      };
    }
  );
}
