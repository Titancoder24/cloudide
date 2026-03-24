'use client';

/**
 * Workspace client — manages the workspace state and provides
 * a simple API for the IDE components to interact with files,
 * terminal, and errors.
 *
 * In the free tier, this wraps NodePod directly.
 * In the paid tier, this communicates with the gateway via WebSocket.
 */

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileEntry[];
}

export interface WorkspaceState {
  files: FileEntry[];
  openFiles: string[];
  activeFile: string | null;
  errors: unknown[];
}

class WorkspaceClient {
  private state: WorkspaceState = {
    files: [],
    openFiles: [],
    activeFile: null,
    errors: [],
  };

  private listeners = new Set<() => void>();
  private fileContents = new Map<string, string>();

  /**
   * Initialize with a set of default files for demo purposes.
   */
  async init(): Promise<void> {
    // Default demo workspace
    this.fileContents.set(
      'package.json',
      JSON.stringify(
        {
          name: 'my-workspace',
          version: '1.0.0',
          scripts: { dev: 'vite', build: 'vite build' },
          dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
          devDependencies: { vite: '^6.0.0', '@vitejs/plugin-react': '^4.0.0' },
        },
        null,
        2
      )
    );

    this.fileContents.set(
      'src/App.tsx',
      `import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Hello from LLM-IDE</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}
`
    );

    this.fileContents.set(
      'src/main.tsx',
      `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
    );

    this.fileContents.set(
      'index.html',
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`
    );

    this.fileContents.set(
      'vite.config.ts',
      `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`
    );

    this.state.files = this.buildFileTree();
    this.notify();
  }

  private buildFileTree(): FileEntry[] {
    const tree: FileEntry[] = [];
    const dirs = new Map<string, FileEntry>();

    // Sort paths to ensure parents come before children
    const paths = Array.from(this.fileContents.keys()).sort();

    for (const filePath of paths) {
      const parts = filePath.split('/');
      const fileName = parts[parts.length - 1];

      if (parts.length === 1) {
        tree.push({ name: fileName, path: filePath, type: 'file' });
      } else {
        // Ensure parent directories exist
        let currentPath = '';
        let parent: FileEntry[] = tree;

        for (let i = 0; i < parts.length - 1; i++) {
          currentPath += (currentPath ? '/' : '') + parts[i];
          let dir = dirs.get(currentPath);
          if (!dir) {
            dir = {
              name: parts[i],
              path: currentPath,
              type: 'directory',
              children: [],
            };
            dirs.set(currentPath, dir);
            parent.push(dir);
          }
          parent = dir.children!;
        }

        parent.push({ name: fileName, path: filePath, type: 'file' });
      }
    }

    return tree;
  }

  getState(): WorkspaceState {
    return this.state;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  async readFile(path: string): Promise<string> {
    return this.fileContents.get(path) || '';
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.fileContents.set(path, content);
    this.state.files = this.buildFileTree();
    this.notify();
  }

  openFile(path: string): void {
    if (!this.state.openFiles.includes(path)) {
      this.state.openFiles.push(path);
    }
    this.state.activeFile = path;
    this.notify();
  }

  closeFile(path: string): void {
    this.state.openFiles = this.state.openFiles.filter((f) => f !== path);
    if (this.state.activeFile === path) {
      this.state.activeFile =
        this.state.openFiles[this.state.openFiles.length - 1] || null;
    }
    this.notify();
  }

  getFileLanguage(path: string): string {
    const ext = path.split('.').pop() || '';
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      css: 'css',
      scss: 'scss',
      html: 'html',
      md: 'markdown',
      yaml: 'yaml',
      yml: 'yaml',
    };
    return langMap[ext] || 'plaintext';
  }
}

// Singleton
export const workspaceClient = new WorkspaceClient();
