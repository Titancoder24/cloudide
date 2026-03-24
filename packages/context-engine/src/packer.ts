import type { ContextOptions, ContextResult } from './types.js';

/**
 * Codebase packer — generates a single AI-friendly document from a project.
 *
 * Uses a built-in packer that produces XML/Markdown/Plain output.
 * Repomix integration is available for advanced features (compression, security scanning)
 * and will be wired up when running in environments where repomix is fully configured.
 *
 * Note: In the browser (free tier), this runs on NodePod's virtual filesystem.
 * On the server (paid tier), this runs on real filesystem.
 */
export async function packCodebase(
  rootPath: string,
  options: ContextOptions = {}
): Promise<ContextResult> {
  return packFromFilesystem(rootPath, options);
}

/**
 * Built-in packer — produces a simple XML/Markdown-formatted codebase dump.
 */
async function packFromFilesystem(
  rootPath: string,
  options: ContextOptions
): Promise<ContextResult> {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const files: Array<{ path: string; content: string }> = [];

  function walk(dir: string, depth = 0): void {
    if (depth > 8) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(rootPath, fullPath);

        if (options.exclude?.some((p) => relPath.includes(p))) continue;

        if (entry.isDirectory()) {
          walk(fullPath, depth + 1);
        } else if (isTextFile(entry.name)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            files.push({ path: relPath, content });
          } catch {
            // Skip unreadable files
          }
        }
      }
    } catch {
      // Skip inaccessible directories
    }
  }

  walk(rootPath);

  const format = options.format || 'xml';
  let output: string;

  if (format === 'xml') {
    output = `<repository>\n<files>\n${files
      .map(
        (f) =>
          `<file path="${f.path}">\n${f.content}\n</file>`
      )
      .join('\n')}\n</files>\n</repository>`;
  } else {
    output = files
      .map((f) => `## ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
      .join('\n\n');
  }

  // Apply token budget
  if (options.maxTokens) {
    const tokens = estimateTokens(output);
    if (tokens > options.maxTokens) {
      // Truncate to fit budget (rough approximation)
      const ratio = options.maxTokens / tokens;
      const maxChars = Math.floor(output.length * ratio);
      output = output.slice(0, maxChars) + '\n<!-- truncated to fit token budget -->';
    }
  }

  return {
    output,
    tokenCount: estimateTokens(output),
    fileCount: files.length,
  };
}

function isTextFile(name: string): boolean {
  const textExtensions = [
    '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
    '.json', '.css', '.scss', '.html', '.md',
    '.yaml', '.yml', '.toml', '.env', '.sh',
    '.sql', '.graphql', '.gql', '.svg',
  ];
  return textExtensions.some((ext) => name.endsWith(ext));
}

function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}
