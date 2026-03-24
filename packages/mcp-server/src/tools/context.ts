import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Workspace } from '../types.js';

/**
 * Context tools — Repomix-style codebase packing for LLM consumption.
 * These are the tools that make the IDE "LLM-native."
 */
export function registerContextTools(
  server: McpServer,
  workspace: Workspace
): void {
  server.tool(
    'get_codebase_context',
    'Pack the entire codebase into a single AI-friendly document',
    {
      include: z.array(z.string()).optional().describe('File globs to include'),
      exclude: z.array(z.string()).optional().describe('File globs to exclude'),
      format: z
        .enum(['xml', 'markdown', 'plain'])
        .optional()
        .describe('Output format (default: xml)'),
      compress: z
        .boolean()
        .optional()
        .describe('Use Tree-sitter compression (~70% token reduction)'),
      max_tokens: z
        .number()
        .optional()
        .describe('Maximum token budget — packs most relevant files first'),
    },
    async ({ include, exclude, format, compress, max_tokens }) => {
      // Build the codebase context by reading the workspace
      const tree = await workspace.directoryTree('.', {
        depth: 6,
        ignorePatterns: ['node_modules', '.git', 'dist', '.next'],
      });

      const allFiles = await workspace.findFiles('*');
      const sourceFiles = allFiles.filter(
        (f) =>
          !f.includes('node_modules') &&
          !f.includes('.git') &&
          !f.includes('dist') &&
          isSourceFile(f)
      );

      // Apply include/exclude filters
      let filteredFiles = sourceFiles;
      if (include && include.length > 0) {
        filteredFiles = filteredFiles.filter((f) =>
          include.some((pattern) => matchGlob(f, pattern))
        );
      }
      if (exclude && exclude.length > 0) {
        filteredFiles = filteredFiles.filter(
          (f) => !exclude.some((pattern) => matchGlob(f, pattern))
        );
      }

      // Read all files
      const fileContents: Array<{ path: string; content: string }> = [];
      let totalTokens = 0;

      for (const filePath of filteredFiles) {
        try {
          const content = await workspace.readFile(filePath);
          const tokens = Math.ceil(content.length / 4);

          if (max_tokens && totalTokens + tokens > max_tokens) {
            if (compress) {
              // Include compressed version (signatures only)
              const compressed = compressCode(content);
              fileContents.push({ path: filePath, content: compressed });
              totalTokens += Math.ceil(compressed.length / 4);
            }
            continue;
          }

          fileContents.push({ path: filePath, content });
          totalTokens += tokens;
        } catch {
          // Skip unreadable files
        }
      }

      // Format output
      const fmt = format || 'xml';
      let output: string;

      if (fmt === 'xml') {
        output = `<repository>
<directory_tree>
${tree}
</directory_tree>

<files>
${fileContents.map((f) => `<file path="${f.path}">\n${f.content}\n</file>`).join('\n\n')}
</files>
</repository>`;
      } else if (fmt === 'markdown') {
        output = `# Repository\n\n## Directory Tree\n\`\`\`\n${tree}\n\`\`\`\n\n${fileContents
          .map((f) => `## ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
          .join('\n\n')}`;
      } else {
        output = `Directory Tree:\n${tree}\n\n${fileContents
          .map((f) => `=== ${f.path} ===\n${f.content}`)
          .join('\n\n')}`;
      }

      return {
        content: [
          {
            type: 'text',
            text: `${output}\n\n<!-- ${fileContents.length} files, ~${totalTokens} tokens -->`,
          },
        ],
      };
    }
  );

  server.tool(
    'get_file_context',
    'Get a file along with its imports and dependents',
    {
      path: z.string().describe('File path'),
      include_imports: z
        .boolean()
        .optional()
        .describe('Include imported files (default: true)'),
    },
    async ({ path: filePath, include_imports }) => {
      const content = await workspace.readFile(filePath);
      const result: string[] = [`=== ${filePath} ===\n${content}`];

      if (include_imports !== false) {
        // Extract import paths
        const importRegex =
          /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
        let match;
        const imports: string[] = [];

        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];
          if (importPath.startsWith('.')) {
            imports.push(importPath);
          }
        }

        // Resolve and read imported files
        for (const imp of imports) {
          const resolved = resolveImportPath(filePath, imp);
          for (const candidate of resolved) {
            try {
              const impContent = await workspace.readFile(candidate);
              result.push(`\n=== ${candidate} (imported) ===\n${impContent}`);
              break;
            } catch {
              // Try next candidate
            }
          }
        }
      }

      return { content: [{ type: 'text', text: result.join('\n') }] };
    }
  );

  server.tool(
    'get_project_summary',
    'Get a high-level overview of the project',
    {},
    async () => {
      // Read package.json
      let pkg: Record<string, unknown> = {};
      try {
        const pkgContent = await workspace.readFile('package.json');
        pkg = JSON.parse(pkgContent);
      } catch {
        // No package.json
      }

      const tree = await workspace.directoryTree('.', { depth: 3 });
      const deps = Object.keys(
        (pkg.dependencies as Record<string, string>) || {}
      );
      const devDeps = Object.keys(
        (pkg.devDependencies as Record<string, string>) || {}
      );

      const summary = [
        `Project: ${pkg.name || 'unknown'}`,
        `Version: ${pkg.version || '0.0.0'}`,
        '',
        `Dependencies: ${deps.length} (${deps.slice(0, 10).join(', ')}${deps.length > 10 ? '...' : ''})`,
        `Dev Dependencies: ${devDeps.length}`,
        `Scripts: ${Object.keys((pkg.scripts as Record<string, string>) || {}).join(', ')}`,
        '',
        'Directory Structure:',
        tree,
      ];

      return {
        content: [{ type: 'text', text: summary.join('\n') }],
      };
    }
  );
}

function isSourceFile(path: string): boolean {
  const exts = [
    '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
    '.json', '.css', '.scss', '.html', '.md',
    '.yaml', '.yml', '.svg', '.env',
  ];
  return exts.some((ext) => path.endsWith(ext));
}

function matchGlob(filePath: string, pattern: string): boolean {
  // Simple glob matching (** = any path, * = any filename)
  const regex = pattern
    .replace(/\*\*/g, '<<<GLOBSTAR>>>')
    .replace(/\*/g, '[^/]*')
    .replace(/<<<GLOBSTAR>>>/g, '.*');
  return new RegExp(`^${regex}$`).test(filePath);
}

function compressCode(content: string): string {
  // Simple compression: keep function/class signatures, strip bodies
  return content
    .replace(
      /\{[^{}]*\}/g,
      '{ /* ... */ }'
    )
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, ''); // Remove line comments
}

function resolveImportPath(
  fromFile: string,
  importPath: string
): string[] {
  const dir = fromFile.replace(/\/[^/]+$/, '');
  const base = `${dir}/${importPath}`.replace(/\/\.\//g, '/');

  // Try different extensions
  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
    `${base}/index.js`,
  ];
}
