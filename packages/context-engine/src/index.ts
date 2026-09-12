export type {
  ContextOptions,
  ContextResult,
  FileNode,
  ProjectInfo,
  FrameworkType,
} from './types.js';

export { packCodebase } from './packer.js';
export { chunkForTokenBudget } from './chunker.js';
export { detectProject } from './detector.js';

import { packCodebase } from './packer.js';
import { chunkForTokenBudget } from './chunker.js';
import { detectProject } from './detector.js';
import type { ContextOptions, ContextResult, ProjectInfo } from './types.js';

/**
 * ContextEngine — the main facade for codebase context operations.
 * Combines Repomix packing, smart chunking, and project detection.
 */
export class ContextEngine {
  private rootPath: string;
  private cache: Map<string, { result: ContextResult; timestamp: number }> =
    new Map();
  private cacheTtlMs = 30_000; // 30 second cache

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  /**
   * Get full codebase context, optionally compressed and chunked.
   */
  async getCodebaseContext(
    options: ContextOptions = {}
  ): Promise<ContextResult> {
    const cacheKey = JSON.stringify(options);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
      return cached.result;
    }

    let result = await packCodebase(this.rootPath, options);

    // Apply token budget chunking if needed
    if (options.maxTokens && result.tokenCount > options.maxTokens) {
      result = chunkForTokenBudget(result, {
        maxTokens: options.maxTokens,
      });
    }

    this.cache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  }

  /**
   * Get project summary (framework, languages, entry points, etc.)
   */
  getProjectSummary(): ProjectInfo {
    return detectProject(this.rootPath);
  }

  /**
   * Invalidate cache (e.g., after file changes).
   */
  invalidateCache(): void {
    this.cache.clear();
  }

  /**
   * Update the root path (e.g., when workspace changes).
   */
  setRootPath(rootPath: string): void {
    this.rootPath = rootPath;
    this.invalidateCache();
  }
}
