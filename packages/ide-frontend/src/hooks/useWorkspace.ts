'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  workspaceClient,
  type WorkspaceState,
} from '@/lib/workspace-client';

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(
    workspaceClient.getState()
  );

  useEffect(() => {
    return workspaceClient.subscribe(() => {
      setState({ ...workspaceClient.getState() });
    });
  }, []);

  const openFile = useCallback((path: string) => {
    workspaceClient.openFile(path);
  }, []);

  const closeFile = useCallback((path: string) => {
    workspaceClient.closeFile(path);
  }, []);

  const readFile = useCallback((path: string) => {
    return workspaceClient.readFile(path);
  }, []);

  const writeFile = useCallback((path: string, content: string) => {
    return workspaceClient.writeFile(path, content);
  }, []);

  return {
    ...state,
    openFile,
    closeFile,
    readFile,
    writeFile,
  };
}
