import type { RawError } from '../normalizer.js';

/**
 * Parse terminal stderr output for errors.
 */
export function parseTerminalError(
  stderr: string,
  exitCode?: number
): RawError | null {
  if (!stderr.trim() && (!exitCode || exitCode === 0)) return null;

  // Try to extract file:line:column pattern
  const locationMatch = stderr.match(
    /(?:at\s+)?([^\s:]+\.(?:ts|tsx|js|jsx|mjs|cjs)):(\d+)(?::(\d+))?/
  );

  return {
    source: 'terminal',
    severity: exitCode !== 0 ? 'error' : 'warning',
    message: stderr.trim().split('\n')[0] || `Process exited with code ${exitCode}`,
    file: locationMatch?.[1],
    line: locationMatch ? parseInt(locationMatch[2], 10) : undefined,
    column: locationMatch?.[3]
      ? parseInt(locationMatch[3], 10)
      : undefined,
    stack_trace: stderr,
  };
}
