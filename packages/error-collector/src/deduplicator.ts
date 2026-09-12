import type { ErrorEntry } from './types.js';

/**
 * Generates a deduplication key from an error's identifying properties.
 * Same file + line + message = same error.
 */
export function deduplicationKey(error: ErrorEntry): string {
  return `${error.file || ''}:${error.line || 0}:${error.message}`;
}

/**
 * Merges a new error occurrence into an existing entry,
 * incrementing the count and updating last_seen.
 */
export function mergeOccurrence(
  existing: ErrorEntry,
  _newEntry: ErrorEntry
): ErrorEntry {
  return {
    ...existing,
    occurrences: existing.occurrences + 1,
    last_seen: new Date().toISOString(),
    // Re-open if it was previously resolved
    status: 'open',
    resolved_by: null,
  };
}
