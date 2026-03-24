import type {
  ErrorEntry,
  ErrorFilter,
  ErrorSummary,
  ErrorStatus,
} from './types.js';
import { deduplicationKey, mergeOccurrence } from './deduplicator.js';

type ErrorListener = (errors: ErrorEntry[]) => void;

/**
 * In-memory error store with deduplication, filtering, and auto-resolve.
 * Resolved errors are kept for 24 hours for pattern analysis.
 */
export class ErrorStore {
  private errors: Map<string, ErrorEntry> = new Map();
  private dedupIndex: Map<string, string> = new Map(); // dedupKey -> errorId
  private listeners: Set<ErrorListener> = new Set();
  private resolvedCleanupMs = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Add or merge an error into the store.
   */
  add(entry: ErrorEntry): ErrorEntry {
    const key = deduplicationKey(entry);
    const existingId = this.dedupIndex.get(key);

    if (existingId) {
      const existing = this.errors.get(existingId);
      if (existing) {
        const merged = mergeOccurrence(existing, entry);
        this.errors.set(existingId, merged);
        this.notify();
        return merged;
      }
    }

    this.errors.set(entry.id, entry);
    this.dedupIndex.set(key, entry.id);
    this.notify();
    return entry;
  }

  /**
   * Get a single error by ID.
   */
  get(id: string): ErrorEntry | undefined {
    return this.errors.get(id);
  }

  /**
   * Get all errors matching the filter.
   */
  getAll(filter?: ErrorFilter): ErrorEntry[] {
    let results = Array.from(this.errors.values());

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        results = results.filter((e) => e.status === filter.status);
      }
      if (filter.severity) {
        results = results.filter((e) => e.severity === filter.severity);
      }
      if (filter.source) {
        results = results.filter((e) => e.source === filter.source);
      }
      if (filter.file) {
        results = results.filter((e) => e.file === filter.file);
      }
      if (filter.since) {
        const sinceDate = new Date(filter.since).getTime();
        results = results.filter(
          (e) => new Date(e.last_seen).getTime() >= sinceDate
        );
      }
    }

    // Sort: errors first, then by recency
    return results.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      const aSev = severityOrder[a.severity];
      const bSev = severityOrder[b.severity];
      if (aSev !== bSev) return aSev - bSev;
      return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
    });
  }

  /**
   * Mark an error as resolved.
   */
  resolve(id: string, resolvedBy: string = 'manual'): boolean {
    const entry = this.errors.get(id);
    if (!entry) return false;

    entry.status = 'resolved';
    entry.resolved_by = resolvedBy;
    this.notify();
    return true;
  }

  /**
   * Auto-resolve errors in a specific file.
   * Called after a file is edited and errors are no longer present.
   */
  autoResolveForFile(filePath: string): number {
    let resolved = 0;
    for (const entry of this.errors.values()) {
      if (entry.file === filePath && entry.status === 'open') {
        entry.status = 'resolved';
        entry.resolved_by = 'auto';
        resolved++;
      }
    }
    if (resolved > 0) this.notify();
    return resolved;
  }

  /**
   * Clear all resolved errors.
   */
  clearResolved(): number {
    let cleared = 0;
    for (const [id, entry] of this.errors) {
      if (entry.status === 'resolved') {
        const key = deduplicationKey(entry);
        this.dedupIndex.delete(key);
        this.errors.delete(id);
        cleared++;
      }
    }
    if (cleared > 0) this.notify();
    return cleared;
  }

  /**
   * Clean up old resolved errors (> 24h).
   */
  cleanup(): number {
    const cutoff = Date.now() - this.resolvedCleanupMs;
    let cleaned = 0;
    for (const [id, entry] of this.errors) {
      if (
        entry.status === 'resolved' &&
        new Date(entry.last_seen).getTime() < cutoff
      ) {
        const key = deduplicationKey(entry);
        this.dedupIndex.delete(key);
        this.errors.delete(id);
        cleaned++;
      }
    }
    return cleaned;
  }

  /**
   * Get a compact summary for LLMs.
   */
  getSummary(): ErrorSummary {
    const all = Array.from(this.errors.values());
    const open = all.filter((e) => e.status === 'open');
    const resolved = all.filter((e) => e.status === 'resolved');

    // Most affected files
    const fileCounts = new Map<string, number>();
    for (const e of open) {
      if (e.file) {
        fileCounts.set(e.file, (fileCounts.get(e.file) || 0) + 1);
      }
    }

    return {
      open_count: open.length,
      resolved_count: resolved.length,
      errors: open.map((e) => ({
        id: e.id,
        type: e.type,
        file: e.file,
        line: e.line,
        message: e.message,
      })),
      most_affected_files: Array.from(fileCounts.entries())
        .map(([file, count]) => ({ file, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }

  /**
   * Subscribe to error changes.
   */
  subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const errors = this.getAll();
    for (const listener of this.listeners) {
      listener(errors);
    }
  }

  get size(): number {
    return this.errors.size;
  }

  get openCount(): number {
    return Array.from(this.errors.values()).filter((e) => e.status === 'open')
      .length;
  }
}
