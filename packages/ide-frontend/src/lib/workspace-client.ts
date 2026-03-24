'use client';

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
  errors: WorkspaceError[];
  projectName: string;
  projectTemplate: string | null;
  terminalHistory: TerminalEntry[];
}

export interface WorkspaceError {
  id: string;
  severity: 'error' | 'warning' | 'info';
  type: string;
  message: string;
  file?: string;
  line?: number;
  status: 'open' | 'resolved';
}

export interface TerminalEntry {
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
  timestamp: number;
}

export type ProjectTemplate =
  | 'react'
  | 'vue'
  | 'svelte'
  | 'express'
  | 'hono'
  | 'next'
  | 'expo'
  | 'expo-router'
  | 'vanilla-ts';

export interface TemplateInfo {
  id: ProjectTemplate;
  name: string;
  description: string;
  icon: string;
  tags: string[];
}

export const PROJECT_TEMPLATES: TemplateInfo[] = [
  { id: 'react', name: 'React + Vite', description: 'React 19 with Vite and TypeScript', icon: '⚛️', tags: ['Frontend', 'TypeScript'] },
  { id: 'next', name: 'Next.js', description: 'Next.js App Router with TypeScript', icon: '▲', tags: ['Fullstack', 'TypeScript'] },
  { id: 'vue', name: 'Vue + Vite', description: 'Vue 3 with Vite and TypeScript', icon: '💚', tags: ['Frontend', 'TypeScript'] },
  { id: 'svelte', name: 'SvelteKit', description: 'SvelteKit with TypeScript', icon: '🔥', tags: ['Frontend', 'TypeScript'] },
  { id: 'express', name: 'Express', description: 'Express.js REST API with TypeScript', icon: '🚀', tags: ['Backend', 'TypeScript'] },
  { id: 'hono', name: 'Hono', description: 'Hono web framework with TypeScript', icon: '🔥', tags: ['Backend', 'TypeScript'] },
  { id: 'expo', name: 'Expo', description: 'Expo with React Native Web', icon: '📱', tags: ['Mobile', 'TypeScript'] },
  { id: 'expo-router', name: 'Expo Router', description: 'Expo with file-based routing', icon: '📱', tags: ['Mobile', 'TypeScript'] },
  { id: 'vanilla-ts', name: 'Vanilla TypeScript', description: 'Minimal TypeScript with Vite', icon: '🔷', tags: ['Frontend', 'TypeScript'] },
];

// ---------------------------------------------------------------------------
// Template file generators
// ---------------------------------------------------------------------------

function templateReact(name: string): Record<string, string> {
  return {
    'package.json': JSON.stringify({ name, private: true, version: '0.1.0', type: 'module', scripts: { dev: 'vite', build: 'tsc && vite build', preview: 'vite preview' }, dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' }, devDependencies: { '@types/react': '^19.0.0', '@types/react-dom': '^19.0.0', '@vitejs/plugin-react': '^4.0.0', typescript: '^5.7.0', vite: '^6.0.0' } }, null, 2),
    'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${name}</title></head>\n<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>\n</html>`,
    'src/main.tsx': `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`,
    'src/App.tsx': `import { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className="app">\n      <h1>${name}</h1>\n      <div className="card">\n        <button onClick={() => setCount(c => c + 1)}>\n          Count is {count}\n        </button>\n      </div>\n      <p>Edit <code>src/App.tsx</code> and save to test HMR.</p>\n    </div>\n  );\n}`,
    'src/index.css': `body {\n  margin: 0;\n  font-family: system-ui, -apple-system, sans-serif;\n  background: #242424;\n  color: #ffffffde;\n}\n\n.app {\n  max-width: 1280px;\n  margin: 0 auto;\n  padding: 2rem;\n  text-align: center;\n}\n\n.card {\n  padding: 2em;\n}\n\nbutton {\n  border-radius: 8px;\n  border: 1px solid transparent;\n  padding: 0.6em 1.2em;\n  font-size: 1em;\n  font-weight: 500;\n  font-family: inherit;\n  background-color: #1a1a1a;\n  color: #ffffffde;\n  cursor: pointer;\n  transition: border-color 0.25s;\n}\n\nbutton:hover {\n  border-color: #646cff;\n}\n\ncode {\n  background: #1a1a1a;\n  padding: 0.15em 0.4em;\n  border-radius: 4px;\n  font-size: 0.85em;\n}`,
    'vite.config.ts': `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n});`,
    'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler', jsx: 'react-jsx', strict: true, skipLibCheck: true }, include: ['src'] }, null, 2),
  };
}

function templateExpress(name: string): Record<string, string> {
  return {
    'package.json': JSON.stringify({ name, private: true, version: '0.1.0', type: 'module', scripts: { dev: 'tsx --watch src/index.ts', start: 'node dist/index.js', build: 'tsc' }, dependencies: { express: '^5.0.0' }, devDependencies: { '@types/express': '^5.0.0', typescript: '^5.7.0', tsx: '^4.19.0' } }, null, 2),
    'src/index.ts': `import express from 'express';\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.use(express.json());\n\napp.get('/', (req, res) => {\n  res.json({ message: 'Hello from ${name}!' });\n});\n\napp.get('/health', (req, res) => {\n  res.json({ status: 'ok', timestamp: new Date().toISOString() });\n});\n\napp.listen(PORT, () => {\n  console.log(\`Server running on http://localhost:\${PORT}\`);\n});`,
    'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', outDir: './dist', rootDir: './src', strict: true, skipLibCheck: true, esModuleInterop: true }, include: ['src'] }, null, 2),
  };
}

function templateHono(name: string): Record<string, string> {
  return {
    'package.json': JSON.stringify({ name, private: true, version: '0.1.0', type: 'module', scripts: { dev: 'tsx --watch src/index.ts', start: 'node dist/index.js' }, dependencies: { hono: '^4.0.0', '@hono/node-server': '^1.0.0' }, devDependencies: { typescript: '^5.7.0', tsx: '^4.19.0' } }, null, 2),
    'src/index.ts': `import { Hono } from 'hono';\nimport { serve } from '@hono/node-server';\n\nconst app = new Hono();\n\napp.get('/', (c) => c.json({ message: 'Hello from ${name}!' }));\napp.get('/health', (c) => c.json({ status: 'ok' }));\n\nserve({ fetch: app.fetch, port: 3000 }, (info) => {\n  console.log(\`Server running on http://localhost:\${info.port}\`);\n});`,
    'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', outDir: './dist', rootDir: './src', strict: true, skipLibCheck: true, esModuleInterop: true }, include: ['src'] }, null, 2),
  };
}

function templateExpo(name: string): Record<string, string> {
  return {
    'package.json': JSON.stringify({ name, private: true, version: '0.1.0', scripts: { dev: 'vite', build: 'vite build' }, dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0', 'react-native-web': '^0.19.0', expo: '^52.0.0' }, devDependencies: { '@vitejs/plugin-react': '^4.0.0', vite: '^6.0.0', typescript: '^5.7.0' } }, null, 2),
    'app.json': JSON.stringify({ expo: { name, slug: name, version: '1.0.0', platforms: ['ios', 'android', 'web'] } }, null, 2),
    'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${name}</title></head>\n<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>\n</html>`,
    'src/main.tsx': `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode><App /></React.StrictMode>\n);`,
    'src/App.tsx': `import { View, Text, StyleSheet, Pressable } from 'react-native';\nimport { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <View style={styles.container}>\n      <Text style={styles.title}>${name}</Text>\n      <Text style={styles.subtitle}>Built with Expo + React Native Web</Text>\n      <Pressable style={styles.button} onPress={() => setCount(c => c + 1)}>\n        <Text style={styles.buttonText}>Count: {count}</Text>\n      </Pressable>\n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },\n  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#1a1a1a' },\n  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },\n  button: { backgroundColor: '#007acc', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },\n  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },\n});`,
    'vite.config.ts': `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  resolve: {\n    alias: { 'react-native': 'react-native-web' },\n    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],\n  },\n  define: {\n    __DEV__: JSON.stringify(true),\n    'process.env.NODE_ENV': JSON.stringify('development'),\n  },\n});`,
  };
}

function templateNext(name: string): Record<string, string> {
  return {
    'package.json': JSON.stringify({ name, private: true, version: '0.1.0', scripts: { dev: 'next dev', build: 'next build', start: 'next start' }, dependencies: { next: '^15.0.0', react: '^19.0.0', 'react-dom': '^19.0.0' }, devDependencies: { '@types/react': '^19.0.0', typescript: '^5.7.0' } }, null, 2),
    'src/app/layout.tsx': `export const metadata = { title: '${name}', description: 'Built with Next.js' };\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>{children}</body>\n    </html>\n  );\n}`,
    'src/app/page.tsx': `export default function Home() {\n  return (\n    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>\n      <h1>${name}</h1>\n      <p>Built with Next.js App Router.</p>\n    </main>\n  );\n}`,
    'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', lib: ['dom', 'dom.iterable', 'ES2022'], jsx: 'preserve', module: 'ESNext', moduleResolution: 'bundler', strict: true, skipLibCheck: true, plugins: [{ name: 'next' }] }, include: ['src'], exclude: ['node_modules'] }, null, 2),
    'next.config.ts': `import type { NextConfig } from 'next';\nconst nextConfig: NextConfig = {};\nexport default nextConfig;`,
  };
}

function templateVanillaTs(name: string): Record<string, string> {
  return {
    'package.json': JSON.stringify({ name, private: true, version: '0.1.0', type: 'module', scripts: { dev: 'vite', build: 'tsc && vite build' }, devDependencies: { typescript: '^5.7.0', vite: '^6.0.0' } }, null, 2),
    'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${name}</title></head>\n<body>\n  <div id="app"></div>\n  <script type="module" src="/src/main.ts"></script>\n</body>\n</html>`,
    'src/main.ts': `const app = document.getElementById('app')!;\napp.innerHTML = '<h1>${name}</h1><p>Edit src/main.ts to get started.</p>';`,
    'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler', strict: true, skipLibCheck: true }, include: ['src'] }, null, 2),
  };
}

function generateTemplateFiles(template: ProjectTemplate, name: string): Record<string, string> {
  switch (template) {
    case 'react': return templateReact(name);
    case 'next': return templateNext(name);
    case 'express': return templateExpress(name);
    case 'hono': return templateHono(name);
    case 'expo':
    case 'expo-router': return templateExpo(name);
    case 'vanilla-ts': return templateVanillaTs(name);
    case 'vue': return { ...templateReact(name), 'src/App.tsx': `<!-- Vue template placeholder -->\n<template>\n  <div>\n    <h1>${name}</h1>\n    <p>Vue 3 with TypeScript</p>\n  </div>\n</template>` };
    case 'svelte': return { ...templateVanillaTs(name), 'src/App.svelte': `<script lang="ts">\n  let count = 0;\n</script>\n\n<main>\n  <h1>${name}</h1>\n  <button on:click={() => count++}>Count: {count}</button>\n</main>` };
    default: return templateReact(name);
  }
}

// ---------------------------------------------------------------------------
// MCP Connection state
// ---------------------------------------------------------------------------

export interface McpConnectionConfig {
  url: string;
  token: string;
  connected: boolean;
  agentName: string;
}

// ---------------------------------------------------------------------------
// WorkspaceClient
// ---------------------------------------------------------------------------

class WorkspaceClient {
  private state: WorkspaceState = {
    files: [],
    openFiles: [],
    activeFile: null,
    errors: [],
    projectName: '',
    projectTemplate: null,
    terminalHistory: [],
  };

  private listeners = new Set<() => void>();
  private fileContents = new Map<string, string>();
  private mcpConnections: McpConnectionConfig[] = [];
  private initialized = false;

  getState(): WorkspaceState {
    return this.state;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getMcpConnections(): McpConnectionConfig[] {
    return [...this.mcpConnections];
  }

  addMcpConnection(config: McpConnectionConfig): void {
    this.mcpConnections.push(config);
    this.notify();
  }

  removeMcpConnection(index: number): void {
    this.mcpConnections.splice(index, 1);
    this.notify();
  }

  /**
   * Create a new project from a template.
   */
  async createProject(template: ProjectTemplate, name: string): Promise<void> {
    this.fileContents.clear();
    this.state.openFiles = [];
    this.state.activeFile = null;
    this.state.projectName = name;
    this.state.projectTemplate = template;
    this.state.terminalHistory = [
      { type: 'system', text: `Created project "${name}" from ${template} template.`, timestamp: Date.now() },
      { type: 'system', text: 'Run "npm install" to install dependencies.', timestamp: Date.now() },
    ];

    const files = generateTemplateFiles(template, name);
    for (const [path, content] of Object.entries(files)) {
      this.fileContents.set(path, content);
    }

    this.state.files = this.buildFileTree();
    this.initialized = true;

    // Auto-open the main file
    const mainFiles = ['src/App.tsx', 'src/App.svelte', 'src/index.ts', 'src/main.ts', 'src/app/page.tsx'];
    for (const f of mainFiles) {
      if (this.fileContents.has(f)) {
        this.openFile(f);
        break;
      }
    }

    this.notify();
  }

  /**
   * Initialize with demo workspace (backward compat).
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    await this.createProject('react', 'my-app');
  }

  /**
   * Load files from an existing set (e.g., imported snapshot).
   */
  loadFiles(files: Record<string, string>, projectName: string): void {
    this.fileContents.clear();
    for (const [path, content] of Object.entries(files)) {
      this.fileContents.set(path, content);
    }
    this.state.projectName = projectName;
    this.state.files = this.buildFileTree();
    this.initialized = true;
    this.notify();
  }

  private buildFileTree(): FileEntry[] {
    const tree: FileEntry[] = [];
    const dirs = new Map<string, FileEntry>();
    const paths = Array.from(this.fileContents.keys()).sort();

    for (const filePath of paths) {
      const parts = filePath.split('/');
      const fileName = parts[parts.length - 1];

      if (parts.length === 1) {
        tree.push({ name: fileName, path: filePath, type: 'file' });
      } else {
        let currentPath = '';
        let parent: FileEntry[] = tree;

        for (let i = 0; i < parts.length - 1; i++) {
          currentPath += (currentPath ? '/' : '') + parts[i];
          let dir = dirs.get(currentPath);
          if (!dir) {
            dir = { name: parts[i], path: currentPath, type: 'directory', children: [] };
            dirs.set(currentPath, dir);
            parent.push(dir);
          }
          parent = dir.children!;
        }
        parent.push({ name: fileName, path: filePath, type: 'file' });
      }
    }

    return this.sortTree(tree);
  }

  private sortTree(entries: FileEntry[]): FileEntry[] {
    return entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    }).map((e) => {
      if (e.children) e.children = this.sortTree(e.children);
      return e;
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try { listener(); } catch { /* ignore */ }
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

  async deleteFile(path: string): Promise<void> {
    // Delete file and any children (for directories)
    const prefix = path + '/';
    for (const key of this.fileContents.keys()) {
      if (key === path || key.startsWith(prefix)) {
        this.fileContents.delete(key);
      }
    }
    this.state.openFiles = this.state.openFiles.filter((f) => f !== path && !f.startsWith(prefix));
    if (this.state.activeFile === path || this.state.activeFile?.startsWith(prefix)) {
      this.state.activeFile = this.state.openFiles[this.state.openFiles.length - 1] || null;
    }
    this.state.files = this.buildFileTree();
    this.notify();
  }

  async createFile(path: string, content = ''): Promise<void> {
    this.fileContents.set(path, content);
    this.state.files = this.buildFileTree();
    this.openFile(path);
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
      this.state.activeFile = this.state.openFiles[this.state.openFiles.length - 1] || null;
    }
    this.notify();
  }

  addTerminalEntry(entry: TerminalEntry): void {
    this.state.terminalHistory.push(entry);
    this.notify();
  }

  clearTerminal(): void {
    this.state.terminalHistory = [];
    this.notify();
  }

  getAllFilePaths(): string[] {
    return Array.from(this.fileContents.keys());
  }

  getFileLanguage(path: string): string {
    const ext = path.split('.').pop() || '';
    const langMap: Record<string, string> = {
      ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
      json: 'json', css: 'css', scss: 'scss', html: 'html', md: 'markdown',
      yaml: 'yaml', yml: 'yaml', svg: 'xml', svelte: 'html',
    };
    return langMap[ext] || 'plaintext';
  }

  /**
   * Export workspace as a serializable object.
   */
  exportWorkspace(): { files: Record<string, string>; name: string; template: string | null } {
    const files: Record<string, string> = {};
    for (const [path, content] of this.fileContents) {
      files[path] = content;
    }
    return { files, name: this.state.projectName, template: this.state.projectTemplate };
  }
}

export const workspaceClient = new WorkspaceClient();
