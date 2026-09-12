export interface ContextOptions {
  include?: string[];
  exclude?: string[];
  format?: 'xml' | 'markdown' | 'plain';
  compress?: boolean;
  maxTokens?: number;
  showLineNumbers?: boolean;
  removeComments?: boolean;
}

export interface ContextResult {
  output: string;
  tokenCount: number;
  fileCount: number;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
}

export interface ProjectInfo {
  name: string;
  framework?: string;
  languages: Record<string, number>;
  totalFiles: number;
  entryPoints: Record<string, string>;
  envVars: string[];
  packageManager: 'npm' | 'yarn' | 'pnpm';
  testFramework?: string;
}

export type FrameworkType =
  | 'react'
  | 'vue'
  | 'svelte'
  | 'solidjs'
  | 'next'
  | 'nuxt'
  | 'express'
  | 'hono'
  | 'expo'
  | 'react-native'
  | 'vite'
  | 'unknown';
