import type { RawError } from '../normalizer.js';

/**
 * Parse TypeScript compiler output for errors.
 * Handles tsc output format: "src/file.ts(42,15): error TS2339: ..."
 */
export function parseTscErrors(output: string): RawError[] {
  const errors: RawError[] = [];
  const lines = output.split('\n');

  for (const line of lines) {
    const match = line.match(
      /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.+)$/
    );
    if (match) {
      errors.push({
        source: 'build',
        severity: match[4] === 'error' ? 'error' : 'warning',
        type: 'TSError',
        message: `${match[5]}: ${match[6]}`,
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
      });
    }
  }

  return errors;
}

/**
 * Parse Vite/esbuild build errors.
 */
export function parseViteBuildErrors(output: string): RawError[] {
  const errors: RawError[] = [];
  const lines = output.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Vite error format: "[vite] Internal server error: ..."
    if (line.includes('[vite]') && line.includes('error')) {
      const message = line.replace(/^\[vite\]\s*/, '').trim();
      const locationMatch = lines[i + 1]?.match(
        /^\s*(.+?):(\d+):(\d+)/
      );

      errors.push({
        source: 'build',
        severity: 'error',
        type: 'BuildError',
        message,
        file: locationMatch?.[1],
        line: locationMatch ? parseInt(locationMatch[2], 10) : undefined,
        column: locationMatch ? parseInt(locationMatch[3], 10) : undefined,
      });
    }
  }

  return errors;
}
