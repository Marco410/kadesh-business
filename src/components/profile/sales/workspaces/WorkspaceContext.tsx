"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  persistWorkspaceId,
  readStoredWorkspaceId,
  subscribeWorkspaceId,
} from "kadesh/components/profile/sales/workspaces/queries";

export interface WorkspaceContextValue {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string | null) => void;
  isWorkspaceSwitching: boolean;
  registerWorkspaceBoardRefetch: (fn: (() => Promise<void>) | null) => void;
  refetchWorkspaceBoardData: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const currentWorkspaceId = useSyncExternalStore(
    subscribeWorkspaceId,
    readStoredWorkspaceId,
    () => null,
  );
  const [isWorkspaceSwitching, setSwitching] = useState(false);
  const boardRefetchRef = useRef<(() => Promise<void>) | null>(null);

  const registerWorkspaceBoardRefetch = useCallback(
    (fn: (() => Promise<void>) | null) => {
      boardRefetchRef.current = fn;
    },
    []
  );

  const refetchWorkspaceBoardData = useCallback(async () => {
    const fn = boardRefetchRef.current;
    if (fn) await fn();
  }, []);

  const setCurrentWorkspaceId = useCallback((id: string | null) => {
    setSwitching(true);
    persistWorkspaceId(id);
    window.setTimeout(() => setSwitching(false), 280);
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      currentWorkspaceId,
      setCurrentWorkspaceId,
      isWorkspaceSwitching,
      registerWorkspaceBoardRefetch,
      refetchWorkspaceBoardData,
    }),
    [
      currentWorkspaceId,
      isWorkspaceSwitching,
      registerWorkspaceBoardRefetch,
      refetchWorkspaceBoardData,
      setCurrentWorkspaceId,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspaceContext debe usarse dentro de WorkspaceProvider");
  }
  return ctx;
}
