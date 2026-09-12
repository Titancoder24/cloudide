export type {
  ErrorEntry,
  ErrorFilter,
  ErrorSummary,
  ErrorSeverity,
  ErrorSource,
  ErrorStatus,
  CodeSnippet,
} from './types.js';

export { ErrorStore } from './store.js';
export { normalizeError, resetIdCounter } from './normalizer.js';
export type { RawError } from './normalizer.js';

// Source parsers
export { parseTerminalError } from './sources/terminal.js';
export { parseTscErrors, parseViteBuildErrors } from './sources/build.js';
export { parseESLintOutput } from './sources/lint.js';
export { parseRuntimeError } from './sources/runtime.js';
export { parsePreviewError } from './sources/preview.js';

import { ErrorStore } from './store.js';
import { normalizeError } from './normalizer.js';
import type { RawError } from './normalizer.js';

/**
 * ErrorCollector - the main pipeline that receives raw errors,
 * normalizes them, and stores them with deduplication.
 */
export class ErrorCollector {
  public readonly store: ErrorStore;

  constructor() {
    this.store = new ErrorStore();
  }

  /**
   * Collect a raw error through the pipeline:
   * raw → normalize → deduplicate → store → notify
   */
  collect(raw: RawError): void {
    const entry = normalizeError(raw);
    this.store.add(entry);
  }

  /**
   * Auto-resolve errors for a file that was just edited.
   * Called after a successful build/typecheck that no longer shows the error.
   */
  autoResolveForFile(filePath: string): number {
    return this.store.autoResolveForFile(filePath);
  }

  /**
   * Get compact summary for LLM consumption.
   */
  getSummary(): string {
    const summary = this.store.getSummary();
    const lines: string[] = [];

    lines.push(
      `${summary.open_count} open errors, ${summary.resolved_count} resolved`
    );

    if (summary.errors.length > 0) {
      lines.push('\nOPEN:');
      for (const e of summary.errors) {
        const location = e.file
          ? `${e.file}${e.line ? `:${e.line}` : ''}`
          : 'unknown';
        lines.push(`  [${e.id}] ${e.type} in ${location} — ${e.message}`);
      }
    }

    if (summary.most_affected_files.length > 0) {
      lines.push(
        `\nMost affected files: ${summary.most_affected_files
          .map((f) => `${f.file} (${f.count} error${f.count > 1 ? 's' : ''})`)
          .join(', ')}`
      );
    }

    return lines.join('\n');
  }
}
