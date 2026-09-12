'use client';

import { useState, useEffect, useCallback } from 'react';
import { workspaceClient, type WorkspaceState } from '@/lib/workspace-client';

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(workspaceClient.getState());

  useEffect(() => {
    return workspaceClient.subscribe(() => {
      setState({ ...workspaceClient.getState() });
    });
  }, []);

  const openFile = useCallback((path: string) => workspaceClient.openFile(path), []);
  const closeFile = useCallback((path: string) => workspaceClient.closeFile(path), []);
  const readFile = useCallback((path: string) => workspaceClient.readFile(path), []);
  const writeFile = useCallback((path: string, content: string) => workspaceClient.writeFile(path, content), []);
  const createFile = useCallback((path: string, content?: string) => workspaceClient.createFile(path, content), []);
  const deleteFile = useCallback((path: string) => workspaceClient.deleteFile(path), []);

  return { ...state, openFile, closeFile, readFile, writeFile, createFile, deleteFile };
}
