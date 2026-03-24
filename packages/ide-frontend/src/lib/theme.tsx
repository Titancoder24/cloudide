'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface ThemeDef {
  id: string;
  name: string;
  dataAttr: string;       // value for data-theme=""
  monacoTheme: string;    // 'vs-dark' | 'light'
}

export const themes: ThemeDef[] = [
  { id: 'dark',        name: 'Dark (Default)', dataAttr: '',            monacoTheme: 'vs-dark' },
  { id: 'dracula',     name: 'Dracula',        dataAttr: 'dracula',     monacoTheme: 'vs-dark' },
  { id: 'one-dark',    name: 'One Dark Pro',   dataAttr: 'one-dark',    monacoTheme: 'vs-dark' },
  { id: 'github-dark', name: 'GitHub Dark',    dataAttr: 'github-dark', monacoTheme: 'vs-dark' },
  { id: 'light',       name: 'Light',          dataAttr: 'light',       monacoTheme: 'light'   },
];

interface ThemeCtx {
  theme: ThemeDef;
  setThemeId: (id: string) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: themes[0],
  setThemeId: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeDef>(themes[0]);

  useEffect(() => {
    const saved = localStorage.getItem('llm-ide-theme');
    if (saved) {
      const found = themes.find((t) => t.id === saved);
      if (found) setTheme(found);
    }
  }, []);

  // Apply data-theme attribute to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme.dataAttr) {
      root.setAttribute('data-theme', theme.dataAttr);
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  const setThemeId = useCallback((id: string) => {
    const found = themes.find((t) => t.id === id);
    if (found) {
      setTheme(found);
      localStorage.setItem('llm-ide-theme', id);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
