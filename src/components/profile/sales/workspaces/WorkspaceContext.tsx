"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  persistWorkspaceId,
  readStoredWorkspaceId,
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
  const [currentWorkspaceId, setId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
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

  useEffect(() => {
    setId(readStoredWorkspaceId());
    setHydrated(true);
  }, []);

  const setCurrentWorkspaceId = useCallback((id: string | null) => {
    setSwitching(true);
    setId(id);
    persistWorkspaceId(id);
    window.setTimeout(() => setSwitching(false), 280);
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      currentWorkspaceId: hydrated ? currentWorkspaceId : null,
      setCurrentWorkspaceId,
      isWorkspaceSwitching,
      registerWorkspaceBoardRefetch,
      refetchWorkspaceBoardData,
    }),
    [
      currentWorkspaceId,
      hydrated,
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
