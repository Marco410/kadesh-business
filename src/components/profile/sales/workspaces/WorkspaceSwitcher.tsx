"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowDown01Icon,
  FolderIcon,
} from "@hugeicons/core-free-icons";
import {
  SAAS_WORKSPACES_QUERY,
  type SaasWorkspacesResponse,
} from "kadesh/components/profile/sales/workspaces/queries";
import { useWorkspaceContext } from "kadesh/components/profile/sales/workspaces/WorkspaceContext";

export interface WorkspaceSwitcherProps {
  enabled: boolean;
  onRequestCreate?: () => void;
  className?: string;
}

export default function WorkspaceSwitcher({
  enabled,
  onRequestCreate,
  className = "",
}: WorkspaceSwitcherProps) {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspaceContext();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { data, loading, refetch } = useQuery<SaasWorkspacesResponse>(
    SAAS_WORKSPACES_QUERY,
    { skip: !enabled, fetchPolicy: "cache-and-network" }
  );

  const workspaces = [...(data?.saasWorkspaces ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );

  const selectedLabel =
    currentWorkspaceId == null
      ? "General · Todos los registros"
      : workspaces.find((w) => w.id === currentWorkspaceId)?.name ??
        "Espacio de trabajo";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex w-full sm:w-auto min-w-[220px] max-w-md items-center justify-between gap-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-4 py-2.5 text-left text-sm font-medium text-[#212121] dark:text-white shadow-sm hover:border-orange-500/40 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <HugeiconsIcon icon={FolderIcon} size={18} />
          </span>
          <span className="truncate">
            {loading && !data ? "Cargando espacios…" : selectedLabel}
          </span>
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={18}
          className={`shrink-0 text-[#616161] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 sm:right-auto z-50 mt-2 w-full sm:min-w-[280px] max-w-md rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] py-1 shadow-lg shadow-black/10"
          role="listbox"
        >
          <button
            type="button"
            role="option"
            aria-selected={currentWorkspaceId == null}
            onClick={() => {
              setCurrentWorkspaceId(null);
              setOpen(false);
            }}
            className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
              currentWorkspaceId == null
                ? "bg-orange-500/10 text-orange-700 dark:text-orange-300 font-medium"
                : "text-[#212121] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
            }`}
          >
            General · Todos los registros
          </button>
          <div className="my-1 h-px bg-[#e0e0e0] dark:bg-[#3a3a3a]" />
          {workspaces.map((w) => (
            <button
              key={w.id}
              type="button"
              role="option"
              aria-selected={currentWorkspaceId === w.id}
              onClick={() => {
                setCurrentWorkspaceId(w.id);
                setOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                currentWorkspaceId === w.id
                  ? "bg-orange-500/10 text-orange-700 dark:text-orange-300 font-medium"
                  : "text-[#212121] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
              }`}
            >
              {w.name}
            </button>
          ))}
          {workspaces.length === 0 && !loading && (
            <p className="px-4 py-3 text-xs text-[#616161] dark:text-[#9e9e9e]">
              Aún no tienes espacios. Crea uno para organizar actividades, tareas y
              propuestas.
            </p>
          )}
          <div className="my-1 h-px bg-[#e0e0e0] dark:bg-[#3a3a3a]" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void refetch();
              onRequestCreate?.();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-500/5 font-medium"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} />
            Crear nuevo espacio
          </button>
        </div>
      )}
    </div>
  );
}
