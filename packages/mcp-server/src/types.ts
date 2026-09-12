/**
 * Workspace abstraction — wraps either a NodePod instance (browser)
 * or a real filesystem (server) behind a uniform interface.
 */
export interface Workspace {
  rootPath: string;
  readFile(path: string, encoding?: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  deleteFile(path: string, recursive?: boolean): Promise<void>;
  moveFile(source: string, destination: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
  listDirectory(
    path: string,
    options?: { recursive?: boolean; includeHidden?: boolean }
  ): Promise<DirectoryEntry[]>;
  directoryTree(
    path: string,
    options?: { depth?: number; ignorePatterns?: string[] }
  ): Promise<string>;
  searchFiles(
    pattern: string,
    options?: {
      path?: string;
      regex?: boolean;
      include?: string[];
      exclude?: string[];
    }
  ): Promise<SearchResult[]>;
  findFiles(pattern: string, searchPath?: string): Promise<string[]>;
  getFileInfo(path: string): Promise<FileInfo>;
  exec(
    command: string,
    options?: { cwd?: string; timeout?: number }
  ): Promise<ExecResult>;
  execBackground(
    command: string,
    options?: { cwd?: string }
  ): Promise<{ pid: number }>;
  killProcess(pid: number): Promise<void>;
  listProcesses(): Promise<ProcessInfo[]>;
  getPreviewUrl(port?: number): string;
  getServerLogs(options?: { lines?: number; since?: string }): Promise<string>;
}

export interface DirectoryEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string;
}

export interface SearchResult {
  file: string;
  line: number;
  column: number;
  match: string;
  context: string;
}

export interface FileInfo {
  path: string;
  size: number;
  modified: string;
  created: string;
  isDirectory: boolean;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ProcessInfo {
  pid: number;
  command: string;
  running: boolean;
}

export interface ResourceSnapshot {
  memory: {
    usedHeapMB: number;
    totalHeapMB: number;
    vfsBytes: number;
    nodeModulesBytes: number;
    percentUsed: number;
  };
  cpu: {
    estimatedPercent: number;
  };
  workspace: {
    fileCount: number;
    packageCount: number;
    processCount: number;
    watcherCount: number;
  };
  warnings: string[];
}
