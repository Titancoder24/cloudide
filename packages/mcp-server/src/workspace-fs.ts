import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as path from 'node:path';
import { execFile, spawn } from 'node:child_process';
import type {
  Workspace,
  DirectoryEntry,
  SearchResult,
  FileInfo,
  ExecResult,
  ProcessInfo,
} from './types.js';

/**
 * Filesystem-based workspace implementation for the server-side (paid tier).
 * For the browser-based free tier, this is replaced by a NodePod adapter.
 */
export class FilesystemWorkspace implements Workspace {
  rootPath: string;
  private processes: Map<number, { command: string; running: boolean }> =
    new Map();

  constructor(rootPath: string) {
    this.rootPath = path.resolve(rootPath);
  }

  private resolve(p: string): string {
    const resolved = path.resolve(this.rootPath, p);
    // Prevent path traversal
    if (!resolved.startsWith(this.rootPath)) {
      throw new Error(`Path traversal detected: ${p}`);
    }
    return resolved;
  }

  async readFile(filePath: string, encoding?: string): Promise<string> {
    return fs.readFile(this.resolve(filePath), {
      encoding: (encoding as BufferEncoding) || 'utf-8',
    });
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const resolved = this.resolve(filePath);
    await fs.mkdir(path.dirname(resolved), { recursive: true });
    await fs.writeFile(resolved, content, 'utf-8');
  }

  async deleteFile(filePath: string, recursive?: boolean): Promise<void> {
    const resolved = this.resolve(filePath);
    const stat = await fs.stat(resolved);
    if (stat.isDirectory() && recursive) {
      await fs.rm(resolved, { recursive: true });
    } else {
      await fs.unlink(resolved);
    }
  }

  async moveFile(source: string, destination: string): Promise<void> {
    await fs.rename(this.resolve(source), this.resolve(destination));
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(this.resolve(filePath));
      return true;
    } catch {
      return false;
    }
  }

  async listDirectory(
    dirPath: string,
    options?: { recursive?: boolean; includeHidden?: boolean }
  ): Promise<DirectoryEntry[]> {
    const resolved = this.resolve(dirPath);
    const entries: DirectoryEntry[] = [];

    async function walk(dir: string, basePath: string): Promise<void> {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        if (!options?.includeHidden && item.name.startsWith('.')) continue;
        if (item.name === 'node_modules') continue;

        const itemPath = path.join(basePath, item.name);
        const fullPath = path.join(dir, item.name);
        const stat = await fs.stat(fullPath);

        entries.push({
          name: item.name,
          path: itemPath,
          type: item.isDirectory() ? 'directory' : 'file',
          size: stat.size,
          modified: stat.mtime.toISOString(),
        });

        if (item.isDirectory() && options?.recursive) {
          await walk(fullPath, itemPath);
        }
      }
    }

    await walk(resolved, dirPath === '.' || dirPath === '/' ? '' : dirPath);
    return entries;
  }

  async directoryTree(
    dirPath: string,
    options?: { depth?: number; ignorePatterns?: string[] }
  ): Promise<string> {
    const maxDepth = options?.depth ?? 4;
    const ignore = new Set(options?.ignorePatterns || ['node_modules', '.git']);
    const lines: string[] = [];

    async function walk(
      dir: string,
      prefix: string,
      depth: number
    ): Promise<void> {
      if (depth > maxDepth) return;
      const items = await fs.readdir(dir, { withFileTypes: true });
      const filtered = items.filter((i) => !ignore.has(i.name));

      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i];
        const isLast = i === filtered.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const fullPath = path.join(dir, item.name);

        lines.push(
          `${prefix}${connector}${item.name}${item.isDirectory() ? '/' : ''}`
        );

        if (item.isDirectory()) {
          const childPrefix = prefix + (isLast ? '    ' : '│   ');
          await walk(fullPath, childPrefix, depth + 1);
        }
      }
    }

    lines.push(path.basename(this.resolve(dirPath)) + '/');
    await walk(this.resolve(dirPath), '', 0);
    return lines.join('\n');
  }

  async searchFiles(
    pattern: string,
    options?: {
      path?: string;
      regex?: boolean;
      include?: string[];
      exclude?: string[];
    }
  ): Promise<SearchResult[]> {
    const searchPath = this.resolve(options?.path || '.');
    const results: SearchResult[] = [];
    const regex = options?.regex ? new RegExp(pattern, 'g') : null;

    async function walk(dir: string): Promise<void> {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.name === 'node_modules' || item.name === '.git') continue;
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          await walk(fullPath);
        } else {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (regex) {
                let match;
                while ((match = regex.exec(line)) !== null) {
                  results.push({
                    file: path.relative(searchPath, fullPath),
                    line: i + 1,
                    column: match.index + 1,
                    match: match[0],
                    context: line.trim(),
                  });
                }
                regex.lastIndex = 0;
              } else if (line.includes(pattern)) {
                results.push({
                  file: path.relative(searchPath, fullPath),
                  line: i + 1,
                  column: line.indexOf(pattern) + 1,
                  match: pattern,
                  context: line.trim(),
                });
              }
            }
          } catch {
            // Skip binary or unreadable files
          }
        }
      }
    }

    await walk(searchPath);
    return results.slice(0, 100); // Limit results
  }

  async findFiles(pattern: string, searchPath?: string): Promise<string[]> {
    const basePath = this.resolve(searchPath || '.');
    const results: string[] = [];
    const globParts = pattern.split('*');

    async function walk(dir: string): Promise<void> {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.name === 'node_modules' || item.name === '.git') continue;
        const fullPath = path.join(dir, item.name);
        const relPath = path.relative(basePath, fullPath);

        if (item.isDirectory()) {
          await walk(fullPath);
        } else {
          // Simple glob matching
          const matches = globParts.every((part) => relPath.includes(part));
          if (matches || relPath.includes(pattern)) {
            results.push(relPath);
          }
        }
      }
    }

    await walk(basePath);
    return results;
  }

  async getFileInfo(filePath: string): Promise<FileInfo> {
    const resolved = this.resolve(filePath);
    const stat = await fs.stat(resolved);
    return {
      path: filePath,
      size: stat.size,
      modified: stat.mtime.toISOString(),
      created: stat.birthtime.toISOString(),
      isDirectory: stat.isDirectory(),
    };
  }

  async exec(
    command: string,
    options?: { cwd?: string; timeout?: number }
  ): Promise<ExecResult> {
    const cwd = options?.cwd
      ? this.resolve(options.cwd)
      : this.rootPath;
    const timeout = options?.timeout || 30_000;

    return new Promise((resolve) => {
      const child = execFile(
        'sh',
        ['-c', command],
        { cwd, timeout, maxBuffer: 5 * 1024 * 1024 },
        (error, stdout, stderr) => {
          resolve({
            stdout: stdout || '',
            stderr: stderr || '',
            exitCode: error ? (error as NodeJS.ErrnoException & { code?: number }).code || 1 : 0,
          });
        }
      );
      // Track process
      if (child.pid) {
        this.processes.set(child.pid, { command, running: true });
        child.on('exit', () => {
          const proc = this.processes.get(child.pid!);
          if (proc) proc.running = false;
        });
      }
    });
  }

  async execBackground(
    command: string,
    options?: { cwd?: string }
  ): Promise<{ pid: number }> {
    const cwd = options?.cwd
      ? this.resolve(options.cwd)
      : this.rootPath;

    const child = spawn('sh', ['-c', command], {
      cwd,
      detached: true,
      stdio: 'pipe',
    });

    const pid = child.pid!;
    this.processes.set(pid, { command, running: true });
    child.on('exit', () => {
      const proc = this.processes.get(pid);
      if (proc) proc.running = false;
    });

    return { pid };
  }

  async killProcess(pid: number): Promise<void> {
    try {
      process.kill(pid, 'SIGTERM');
      const proc = this.processes.get(pid);
      if (proc) proc.running = false;
    } catch {
      // Process already dead
    }
  }

  async listProcesses(): Promise<ProcessInfo[]> {
    return Array.from(this.processes.entries()).map(([pid, info]) => ({
      pid,
      command: info.command,
      running: info.running,
    }));
  }

  getPreviewUrl(port?: number): string {
    return `http://localhost:${port || 3000}`;
  }

  async getServerLogs(options?: {
    lines?: number;
    since?: string;
  }): Promise<string> {
    // In production, this would read from a log buffer
    return `[Server logs not available in filesystem mode. Use run_command to check process output.]`;
  }
}
