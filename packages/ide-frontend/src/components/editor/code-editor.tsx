'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { workspaceClient } from '@/lib/workspace-client';
import { useTheme } from '@/lib/theme';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.default),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-sm text-ide-text-muted">Loading editor...</div> }
);

export function CodeEditor({ filePath }: { filePath: string }) {
  const [content, setContent] = useState<string | null>(null);
  const { theme } = useTheme();
  const language = workspaceClient.getFileLanguage(filePath);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => { workspaceClient.readFile(filePath).then(setContent); }, [filePath]);

  const onChange = useCallback((v: string | undefined) => {
    if (v === undefined) return;
    setContent(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => workspaceClient.writeFile(filePath, v), 300);
  }, [filePath]);

  if (content === null) return <div className="flex h-full items-center justify-center text-sm text-ide-text-muted">Loading...</div>;

  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={content}
      onChange={onChange}
      theme={theme.monacoTheme}
      options={{
        fontSize: 14, lineHeight: 21,
        fontFamily: "'JetBrains Mono','Fira Code','SF Mono',Menlo,monospace",
        minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on',
        tabSize: 2, automaticLayout: true, padding: { top: 8, bottom: 8 },
        renderLineHighlight: 'line', smoothScrolling: true,
        cursorBlinking: 'smooth', cursorSmoothCaretAnimation: 'on',
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
        overviewRulerLanes: 0, hideCursorInOverviewRuler: true,
        lineNumbersMinChars: 3, glyphMargin: false, folding: true, links: true,
      }}
    />
  );
}
