import type { RawError } from '../normalizer.js';
import type { ErrorSeverity } from '../types.js';

interface ESLintMessage {
  ruleId: string | null;
  severity: 1 | 2;
  message: string;
  line: number;
  column: number;
}

interface ESLintResult {
  filePath: string;
  messages: ESLintMessage[];
}

/**
 * Parse ESLint JSON output into structured errors.
 */
export function parseESLintOutput(jsonOutput: string): RawError[] {
  const errors: RawError[] = [];

  let results: ESLintResult[];
  try {
    results = JSON.parse(jsonOutput);
  } catch {
    return errors;
  }

  for (const result of results) {
    for (const msg of result.messages) {
      const severity: ErrorSeverity = msg.severity === 2 ? 'error' : 'warning';
      errors.push({
        source: 'lint',
        severity,
        type: 'ESLint',
        message: `${msg.ruleId ? `[${msg.ruleId}] ` : ''}${msg.message}`,
        file: result.filePath,
        line: msg.line,
        column: msg.column,
      });
    }
  }

  return errors;
}
