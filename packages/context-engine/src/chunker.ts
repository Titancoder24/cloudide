import type { ContextResult } from './types.js';

interface ChunkOptions {
  maxTokens: number;
  priorityFiles?: string[];
}

/**
 * Smart chunking for large projects that exceed LLM context windows.
 *
 * Strategy:
 * 1. Config files and entry points first (package.json, tsconfig, etc.)
 * 2. Priority files (recently edited, explicitly requested)
 * 3. Source files sorted by import relevance
 * 4. Everything else until token budget is exhausted
 */
export function chunkForTokenBudget(
  fullResult: ContextResult,
  options: ChunkOptions
): ContextResult {
  const { maxTokens } = options;

  if (fullResult.tokenCount <= maxTokens) {
    return fullResult;
  }

  // Token budget exceeded — need to truncate intelligently
  const lines = fullResult.output.split('\n');
  const chunks: string[] = [];
  let currentTokens = 0;

  // Extract file blocks from XML format
  const fileBlocks = extractFileBlocks(fullResult.output);

  // Priority order for files
  const configPatterns = [
    'package.json',
    'tsconfig.json',
    'vite.config',
    'next.config',
    'app.json',
    '.env.example',
  ];

  const prioritized = [...fileBlocks].sort((a, b) => {
    const aConfig = configPatterns.some((p) => a.path.includes(p));
    const bConfig = configPatterns.some((p) => b.path.includes(p));
    if (aConfig && !bConfig) return -1;
    if (!aConfig && bConfig) return 1;

    const aPriority = options.priorityFiles?.includes(a.path);
    const bPriority = options.priorityFiles?.includes(b.path);
    if (aPriority && !bPriority) return -1;
    if (!aPriority && bPriority) return 1;

    // Source files before tests
    const aTest = a.path.includes('.test.') || a.path.includes('.spec.');
    const bTest = b.path.includes('.test.') || b.path.includes('.spec.');
    if (aTest && !bTest) return 1;
    if (!aTest && bTest) return -1;

    return 0;
  });

  for (const block of prioritized) {
    const blockTokens = estimateTokens(block.content);
    if (currentTokens + blockTokens > maxTokens) {
      // Try to fit a compressed version
      if (currentTokens + blockTokens * 0.3 < maxTokens) {
        chunks.push(compressBlock(block));
        currentTokens += blockTokens * 0.3;
      }
      continue;
    }
    chunks.push(block.content);
    currentTokens += blockTokens;
  }

  const output = chunks.join('\n');
  return {
    output,
    tokenCount: Math.ceil(currentTokens),
    fileCount: chunks.length,
  };
}

interface FileBlock {
  path: string;
  content: string;
}

function extractFileBlocks(xml: string): FileBlock[] {
  const blocks: FileBlock[] = [];
  const regex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
  let match;

  while ((match = regex.exec(xml)) !== null) {
    blocks.push({ path: match[1], content: match[0] });
  }

  // If no XML blocks found, treat as plain text
  if (blocks.length === 0) {
    blocks.push({ path: 'full', content: xml });
  }

  return blocks;
}

function compressBlock(block: FileBlock): string {
  // Strip function bodies, keep signatures
  const compressed = block.content
    .replace(/\{[^{}]*\}/g, '{ /* ... */ }')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  return compressed;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
