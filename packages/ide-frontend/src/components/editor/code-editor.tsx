'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { workspaceClient } from '@/lib/workspace-client';

// Monaco must be loaded client-side only
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { ssr: false }
);

interface CodeEditorProps {
  filePath: string;
}

export function CodeEditor({ filePath }: CodeEditorProps) {
  const [content, setContent] = useState<string | null>(null);
  const language = workspaceClient.getFileLanguage(filePath);

  useEffect(() => {
    workspaceClient.readFile(filePath).then(setContent);
  }, [filePath]);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        workspaceClient.writeFile(filePath, value);
      }
    },
    [filePath]
  );

  if (content === null) {
    return (
      <div className="flex h-full items-center justify-center text-[#858585]">
        Loading...
      </div>
    );
  }

  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={content}
      onChange={handleChange}
      theme="vs-dark"
      options={{
        fontSize: 14,
        lineHeight: 20,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        automaticLayout: true,
        padding: { top: 8 },
        renderLineHighlight: 'line',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        bracketPairColorization: { enabled: true },
      }}
    />
  );
}
