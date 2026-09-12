import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Workspace } from '../types.js';

/**
 * Package compatibility registry — warns about packages that don't work
 * in the browser-based NodePod runtime.
 */
const KNOWN_INCOMPATIBLE: Record<
  string,
  { status: string; alternative?: string; reason: string }
> = {
  bcrypt: {
    status: 'incompatible',
    alternative: 'bcryptjs',
    reason: 'Requires native bindings',
  },
  sharp: {
    status: 'incompatible',
    alternative: 'jimp',
    reason: 'Requires native bindings (libvips)',
  },
  'better-sqlite3': {
    status: 'incompatible',
    alternative: 'sql.js',
    reason: 'Requires native bindings',
  },
  canvas: {
    status: 'incompatible',
    alternative: 'canvas-wasm',
    reason: 'Requires native bindings (Cairo)',
  },
  fsevents: {
    status: 'compatible',
    reason: 'Auto-shimmed by NodePod',
  },
  esbuild: {
    status: 'compatible',
    reason: 'Auto-shimmed to esbuild-wasm by NodePod',
  },
};

export function registerNpmTools(
  server: McpServer,
  workspace: Workspace
): void {
  server.tool(
    'npm_install',
    'Install npm packages',
    {
      packages: z
        .array(z.string())
        .optional()
        .describe('Package names to install (empty = install from package.json)'),
      dev: z.boolean().optional().describe('Install as devDependency'),
    },
    async ({ packages, dev }) => {
      let cmd = 'npm install';
      if (packages && packages.length > 0) {
        // Check compatibility
        const warnings: string[] = [];
        for (const pkg of packages) {
          const name = pkg.replace(/@[^/]+$/, ''); // strip version
          const info = KNOWN_INCOMPATIBLE[name];
          if (info && info.status === 'incompatible') {
            warnings.push(
              `⚠ ${name}: ${info.reason}. Use ${info.alternative || 'an alternative'} instead.`
            );
          }
        }

        cmd += dev ? ' -D' : '';
        cmd += ` ${packages.join(' ')}`;

        if (warnings.length > 0) {
          const result = await workspace.exec(cmd);
          return {
            content: [
              {
                type: 'text',
                text: `${result.stdout}\n\nCompatibility warnings:\n${warnings.join('\n')}`,
              },
            ],
          };
        }
      }

      const result = await workspace.exec(cmd);
      return {
        content: [
          {
            type: 'text',
            text: result.stdout || result.stderr || 'Installed successfully.',
          },
        ],
      };
    }
  );

  server.tool(
    'npm_run',
    'Run a script from package.json',
    {
      script: z.string().describe('Script name to run'),
      args: z.string().optional().describe('Additional arguments'),
    },
    async ({ script, args }) => {
      const cmd = `npm run ${script}${args ? ` -- ${args}` : ''}`;
      const result = await workspace.exec(cmd, { timeout: 60_000 });
      const output = [result.stdout, result.stderr]
        .filter(Boolean)
        .join('\n');
      return { content: [{ type: 'text', text: output || '(completed)' }] };
    }
  );

  server.tool(
    'list_packages',
    'List installed npm dependencies',
    {},
    async () => {
      const result = await workspace.exec('npm ls --depth=0 --json');
      try {
        const data = JSON.parse(result.stdout);
        const deps = Object.entries(data.dependencies || {})
          .map(
            ([name, info]: [string, unknown]) =>
              `  ${name}@${(info as { version: string }).version}`
          )
          .join('\n');
        return {
          content: [
            { type: 'text', text: deps || 'No dependencies installed.' },
          ],
        };
      } catch {
        return {
          content: [{ type: 'text', text: result.stdout || 'No dependencies.' }],
        };
      }
    }
  );

  server.tool(
    'check_package_compatibility',
    'Check if packages are compatible with the browser-based runtime',
    {
      packages: z.array(z.string()).describe('Package names to check'),
    },
    async ({ packages }) => {
      const results = packages.map((pkg) => {
        const info = KNOWN_INCOMPATIBLE[pkg];
        return {
          name: pkg,
          status: info?.status || 'compatible',
          alternative: info?.status === 'incompatible' ? info.alternative : undefined,
          reason: info?.reason || 'No known issues',
        };
      });

      return {
        content: [
          { type: 'text', text: JSON.stringify(results, null, 2) },
        ],
      };
    }
  );
}
