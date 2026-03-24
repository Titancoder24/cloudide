'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgInput: string;
  border: string;
  borderActive: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentMuted: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  tabActive: string;
  tabInactive: string;
  statusBar: string;
  statusBarText: string;
  sidebarBg: string;
  editorBg: string;
  terminalBg: string;
  hoverBg: string;
  selectedBg: string;
}

export interface Theme {
  id: string;
  name: string;
  monacoTheme: string;
  colors: ThemeColors;
}

const darkDefault: Theme = {
  id: 'dark-default',
  name: 'Dark (Default)',
  monacoTheme: 'vs-dark',
  colors: {
    bgPrimary: '#1e1e1e',
    bgSecondary: '#252526',
    bgTertiary: '#2d2d2d',
    bgInput: '#3c3c3c',
    border: '#3e3e42',
    borderActive: '#007acc',
    textPrimary: '#cccccc',
    textSecondary: '#969696',
    textMuted: '#6e7681',
    accent: '#007acc',
    accentHover: '#1a8ad4',
    accentMuted: '#264f78',
    success: '#4ec9b0',
    warning: '#cca700',
    error: '#f44747',
    info: '#75beff',
    tabActive: '#1e1e1e',
    tabInactive: '#2d2d2d',
    statusBar: '#007acc',
    statusBarText: '#ffffff',
    sidebarBg: '#252526',
    editorBg: '#1e1e1e',
    terminalBg: '#1e1e1e',
    hoverBg: '#2a2d2e',
    selectedBg: '#094771',
  },
};

const darkDracula: Theme = {
  id: 'dark-dracula',
  name: 'Dracula',
  monacoTheme: 'vs-dark',
  colors: {
    bgPrimary: '#282a36',
    bgSecondary: '#21222c',
    bgTertiary: '#343746',
    bgInput: '#44475a',
    border: '#44475a',
    borderActive: '#bd93f9',
    textPrimary: '#f8f8f2',
    textSecondary: '#bfbfbf',
    textMuted: '#6272a4',
    accent: '#bd93f9',
    accentHover: '#caa8fc',
    accentMuted: '#44475a',
    success: '#50fa7b',
    warning: '#f1fa8c',
    error: '#ff5555',
    info: '#8be9fd',
    tabActive: '#282a36',
    tabInactive: '#21222c',
    statusBar: '#bd93f9',
    statusBarText: '#282a36',
    sidebarBg: '#21222c',
    editorBg: '#282a36',
    terminalBg: '#282a36',
    hoverBg: '#343746',
    selectedBg: '#44475a',
  },
};

const darkOnePro: Theme = {
  id: 'dark-one-pro',
  name: 'One Dark Pro',
  monacoTheme: 'vs-dark',
  colors: {
    bgPrimary: '#282c34',
    bgSecondary: '#21252b',
    bgTertiary: '#2c313a',
    bgInput: '#3a3f4b',
    border: '#3e4451',
    borderActive: '#528bff',
    textPrimary: '#abb2bf',
    textSecondary: '#848b98',
    textMuted: '#5c6370',
    accent: '#528bff',
    accentHover: '#6b9cff',
    accentMuted: '#3a3f4b',
    success: '#98c379',
    warning: '#e5c07b',
    error: '#e06c75',
    info: '#61afef',
    tabActive: '#282c34',
    tabInactive: '#21252b',
    statusBar: '#528bff',
    statusBarText: '#ffffff',
    sidebarBg: '#21252b',
    editorBg: '#282c34',
    terminalBg: '#282c34',
    hoverBg: '#2c313a',
    selectedBg: '#3e4451',
  },
};

const darkGithub: Theme = {
  id: 'dark-github',
  name: 'GitHub Dark',
  monacoTheme: 'vs-dark',
  colors: {
    bgPrimary: '#0d1117',
    bgSecondary: '#161b22',
    bgTertiary: '#1c2128',
    bgInput: '#21262d',
    border: '#30363d',
    borderActive: '#58a6ff',
    textPrimary: '#c9d1d9',
    textSecondary: '#8b949e',
    textMuted: '#484f58',
    accent: '#58a6ff',
    accentHover: '#79c0ff',
    accentMuted: '#1f6feb33',
    success: '#3fb950',
    warning: '#d29922',
    error: '#f85149',
    info: '#58a6ff',
    tabActive: '#0d1117',
    tabInactive: '#161b22',
    statusBar: '#58a6ff',
    statusBarText: '#ffffff',
    sidebarBg: '#161b22',
    editorBg: '#0d1117',
    terminalBg: '#0d1117',
    hoverBg: '#1c2128',
    selectedBg: '#1f6feb33',
  },
};

const lightDefault: Theme = {
  id: 'light-default',
  name: 'Light',
  monacoTheme: 'light',
  colors: {
    bgPrimary: '#ffffff',
    bgSecondary: '#f3f3f3',
    bgTertiary: '#ececec',
    bgInput: '#ffffff',
    border: '#d4d4d4',
    borderActive: '#0078d4',
    textPrimary: '#1e1e1e',
    textSecondary: '#616161',
    textMuted: '#a0a0a0',
    accent: '#0078d4',
    accentHover: '#106ebe',
    accentMuted: '#cce4f7',
    success: '#16825d',
    warning: '#bf8803',
    error: '#cd3131',
    info: '#0078d4',
    tabActive: '#ffffff',
    tabInactive: '#ececec',
    statusBar: '#0078d4',
    statusBarText: '#ffffff',
    sidebarBg: '#f3f3f3',
    editorBg: '#ffffff',
    terminalBg: '#ffffff',
    hoverBg: '#e8e8e8',
    selectedBg: '#cce4f7',
  },
};

export const themes: Theme[] = [
  darkDefault,
  darkDracula,
  darkOnePro,
  darkGithub,
  lightDefault,
];

interface ThemeContextType {
  theme: Theme;
  setThemeId: (id: string) => void;
  c: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkDefault,
  setThemeId: () => {},
  c: darkDefault.colors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(darkDefault);

  useEffect(() => {
    const saved = localStorage.getItem('llm-ide-theme');
    if (saved) {
      const found = themes.find((t) => t.id === saved);
      if (found) setTheme(found);
    }
  }, []);

  const setThemeId = useCallback((id: string) => {
    const found = themes.find((t) => t.id === id);
    if (found) {
      setTheme(found);
      localStorage.setItem('llm-ide-theme', id);
    }
  }, []);

  // Apply CSS variables to <html>
  useEffect(() => {
    const root = document.documentElement;
    const c = theme.colors;
    root.style.setProperty('--bg-primary', c.bgPrimary);
    root.style.setProperty('--bg-secondary', c.bgSecondary);
    root.style.setProperty('--bg-tertiary', c.bgTertiary);
    root.style.setProperty('--border-color', c.border);
    root.style.setProperty('--text-primary', c.textPrimary);
    root.style.setProperty('--text-secondary', c.textSecondary);
    root.style.setProperty('--accent-blue', c.accent);
    root.style.setProperty('--accent-green', c.success);
    root.style.setProperty('--accent-orange', c.warning);
    root.style.setProperty('--accent-red', c.error);
    root.style.backgroundColor = c.bgPrimary;
    root.style.color = c.textPrimary;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setThemeId, c: theme.colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
