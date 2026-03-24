import type { FrameworkType, ProjectInfo } from './types.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Auto-detect project framework, languages, entry points, etc.
 */
export function detectProject(rootPath: string): ProjectInfo {
  const pkgJsonPath = path.join(rootPath, 'package.json');
  let pkg: Record<string, unknown> = {};

  try {
    pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  } catch {
    // No package.json
  }

  const deps = {
    ...(pkg.dependencies as Record<string, string> || {}),
    ...(pkg.devDependencies as Record<string, string> || {}),
  };

  const framework = detectFramework(deps, rootPath);
  const languages = detectLanguages(rootPath);
  const envVars = detectEnvVars(rootPath);
  const packageManager = detectPackageManager(rootPath);
  const testFramework = detectTestFramework(deps);

  return {
    name: (pkg.name as string) || path.basename(rootPath),
    framework: framework !== 'unknown' ? framework : undefined,
    languages,
    totalFiles: 0, // Filled in by the context engine
    entryPoints: (pkg.scripts as Record<string, string>) || {},
    envVars,
    packageManager,
    testFramework,
  };
}

function detectFramework(
  deps: Record<string, string>,
  rootPath: string
): FrameworkType {
  // Check for specific frameworks (most specific first)
  if (deps['next'] || fileExists(rootPath, 'next.config.js') || fileExists(rootPath, 'next.config.ts'))
    return 'next';
  if (deps['expo'] || fileExists(rootPath, 'app.json'))
    return 'expo';
  if (deps['react-native'])
    return 'react-native';
  if (deps['nuxt'] || fileExists(rootPath, 'nuxt.config.ts'))
    return 'nuxt';
  if (deps['svelte'] || deps['@sveltejs/kit'])
    return 'svelte';
  if (deps['vue'])
    return 'vue';
  if (deps['solid-js'])
    return 'solidjs';
  if (deps['hono'])
    return 'hono';
  if (deps['express'])
    return 'express';
  if (deps['react'])
    return 'react';
  if (deps['vite'])
    return 'vite';
  return 'unknown';
}

function detectLanguages(rootPath: string): Record<string, number> {
  const counts: Record<string, number> = {};
  const extensions: Record<string, string> = {
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.json': 'JSON',
    '.html': 'HTML',
    '.md': 'Markdown',
  };

  try {
    walkFiles(rootPath, (filePath) => {
      const ext = path.extname(filePath);
      const lang = extensions[ext];
      if (lang) {
        counts[lang] = (counts[lang] || 0) + 1;
      }
    });
  } catch {
    // Filesystem may not be accessible
  }

  return counts;
}

function detectEnvVars(rootPath: string): string[] {
  const envFiles = ['.env.example', '.env.local.example', '.env'];
  const vars: Set<string> = new Set();

  for (const envFile of envFiles) {
    try {
      const content = fs.readFileSync(path.join(rootPath, envFile), 'utf-8');
      for (const line of content.split('\n')) {
        const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
        if (match) vars.add(match[1]);
      }
    } catch {
      // File doesn't exist
    }
  }

  return Array.from(vars);
}

function detectPackageManager(
  rootPath: string
): 'npm' | 'yarn' | 'pnpm' {
  if (fileExists(rootPath, 'pnpm-lock.yaml')) return 'pnpm';
  if (fileExists(rootPath, 'yarn.lock')) return 'yarn';
  return 'npm';
}

function detectTestFramework(
  deps: Record<string, string>
): string | undefined {
  if (deps['vitest']) return 'vitest';
  if (deps['jest']) return 'jest';
  if (deps['mocha']) return 'mocha';
  if (deps['ava']) return 'ava';
  return undefined;
}

function fileExists(dir: string, name: string): boolean {
  try {
    fs.accessSync(path.join(dir, name));
    return true;
  } catch {
    return false;
  }
}

function walkFiles(
  dir: string,
  callback: (filePath: string) => void,
  depth = 0
): void {
  if (depth > 5) return; // Don't go too deep
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkFiles(fullPath, callback, depth + 1);
      } else {
        callback(fullPath);
      }
    }
  } catch {
    // Permission denied or not a directory
  }
}
