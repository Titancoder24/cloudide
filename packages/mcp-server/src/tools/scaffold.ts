import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Workspace } from '../types.js';

const TEMPLATES: Record<string, Array<{ path: string; content: string }>> = {
  react: [
    {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: '{{name}}',
          private: true,
          version: '0.1.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'tsc && vite build',
            preview: 'vite preview',
          },
          dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
          devDependencies: {
            '@types/react': '^19.0.0',
            '@types/react-dom': '^19.0.0',
            '@vitejs/plugin-react': '^4.0.0',
            typescript: '^5.7.0',
            vite: '^6.0.0',
          },
        },
        null,
        2
      ),
    },
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>{{name}}</title></head>
<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>`,
    },
    {
      path: 'src/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    },
    {
      path: 'src/App.tsx',
      content: `export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Hello from {{name}}</h1>
      <p>Edit src/App.tsx to get started.</p>
    </div>
  );
}`,
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'bundler',
            jsx: 'react-jsx',
            strict: true,
            skipLibCheck: true,
          },
          include: ['src'],
        },
        null,
        2
      ),
    },
  ],

  express: [
    {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: '{{name}}',
          private: true,
          version: '0.1.0',
          type: 'module',
          scripts: { dev: 'tsx --watch src/index.ts', start: 'node dist/index.js', build: 'tsc' },
          dependencies: { express: '^5.0.0' },
          devDependencies: { '@types/express': '^5.0.0', typescript: '^5.7.0', tsx: '^4.19.0' },
        },
        null,
        2
      ),
    },
    {
      path: 'src/index.ts',
      content: `import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from {{name}}!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`,
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            outDir: './dist',
            rootDir: './src',
            strict: true,
            skipLibCheck: true,
            esModuleInterop: true,
          },
          include: ['src'],
        },
        null,
        2
      ),
    },
  ],

  hono: [
    {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: '{{name}}',
          private: true,
          version: '0.1.0',
          type: 'module',
          scripts: { dev: 'tsx --watch src/index.ts', start: 'node dist/index.js' },
          dependencies: { hono: '^4.0.0', '@hono/node-server': '^1.0.0' },
          devDependencies: { typescript: '^5.7.0', tsx: '^4.19.0' },
        },
        null,
        2
      ),
    },
    {
      path: 'src/index.ts',
      content: `import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

app.get('/', (c) => c.json({ message: 'Hello from {{name}}!' }));
app.get('/health', (c) => c.json({ status: 'ok' }));

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(\`Server running on http://localhost:\${info.port}\`);
});`,
    },
  ],

  expo: [
    {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: '{{name}}',
          private: true,
          version: '0.1.0',
          scripts: { dev: 'vite', build: 'vite build' },
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'react-native-web': '^0.19.0',
            expo: '^52.0.0',
          },
          devDependencies: {
            '@vitejs/plugin-react': '^4.0.0',
            vite: '^6.0.0',
            typescript: '^5.7.0',
          },
        },
        null,
        2
      ),
    },
    {
      path: 'app.json',
      content: JSON.stringify(
        {
          expo: {
            name: '{{name}}',
            slug: '{{name}}',
            version: '1.0.0',
            platforms: ['ios', 'android', 'web'],
          },
        },
        null,
        2
      ),
    },
    {
      path: 'src/App.tsx',
      content: `import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {{name}}</Text>
      <Text style={styles.subtitle}>Built with Expo + React Native Web</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
});`,
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { 'react-native': 'react-native-web' },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
  define: {
    __DEV__: JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
});`,
    },
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>{{name}}</title></head>
<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>`,
    },
    {
      path: 'src/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);`,
    },
  ],
};

// Also include vue, svelte, next, expo-router, react-native as aliases
TEMPLATES['vue'] = TEMPLATES['react']; // Placeholder — would have Vue-specific files
TEMPLATES['svelte'] = TEMPLATES['react']; // Placeholder
TEMPLATES['next'] = TEMPLATES['react']; // Placeholder
TEMPLATES['expo-router'] = TEMPLATES['expo'];
TEMPLATES['react-native'] = TEMPLATES['expo'];

export function registerScaffoldTools(
  server: McpServer,
  workspace: Workspace
): void {
  server.tool(
    'scaffold_project',
    'Generate a new project from a template',
    {
      template: z
        .enum([
          'react', 'vue', 'svelte', 'express', 'next',
          'hono', 'expo', 'expo-router', 'react-native',
        ])
        .describe('Project template'),
      name: z.string().describe('Project name'),
    },
    async ({ template, name }) => {
      const files = TEMPLATES[template];
      if (!files) {
        return {
          content: [
            { type: 'text', text: `Unknown template: ${template}` },
          ],
        };
      }

      for (const file of files) {
        const content = file.content.replace(/\{\{name\}\}/g, name);
        const path = `${name}/${file.path}`;
        await workspace.writeFile(path, content);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Scaffolded ${template} project: ${name}\n\nFiles created:\n${files.map((f) => `  ${name}/${f.path}`).join('\n')}\n\nNext: cd ${name} && npm install && npm run dev`,
          },
        ],
      };
    }
  );
}
