import type { RawError } from '../normalizer.js';

/**
 * Parse a runtime error (uncaught exception, unhandled rejection, console.error).
 */
export function parseRuntimeError(
  error: Error | string,
  context?: string
): RawError {
  const isError = error instanceof Error;
  const message = isError ? error.message : String(error);
  const stack = isError ? error.stack : undefined;

  // Try to extract file:line from stack trace
  let file: string | undefined;
  let line: number | undefined;
  let column: number | undefined;

  if (stack) {
    const match = stack.match(
      /at\s+.+?\s+\((.+?):(\d+):(\d+)\)/
    );
    if (match) {
      file = match[1];
      line = parseInt(match[2], 10);
      column = parseInt(match[3], 10);
    }
  }

  return {
    source: 'runtime',
    severity: 'error',
    type: isError ? error.constructor.name : 'RuntimeError',
    message: context ? `[${context}] ${message}` : message,
    file,
    line,
    column,
    stack_trace: stack,
  };
}
