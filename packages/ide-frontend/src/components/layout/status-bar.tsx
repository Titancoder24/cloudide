'use client';

import { useWorkspace } from '@/hooks/useWorkspace';

export function StatusBar() {
  const { activeFile, openFiles, errors } = useWorkspace();

  return (
    <div className="flex h-6 items-center justify-between border-t border-[#3e3e42] bg-[#007acc] px-3 text-[11px] text-white">
      <div className="flex items-center gap-3">
        <span>LLM-IDE</span>
        {errors.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
            {errors.length} error{errors.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span>{openFiles.length} open files</span>
        {activeFile && (
          <span>
            {activeFile.split('.').pop()?.toUpperCase()}
          </span>
        )}
        <span>MCP: Ready</span>
      </div>
    </div>
  );
}
