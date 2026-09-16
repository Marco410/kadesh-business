"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Cancel01Icon,
  Search01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import type { VendedorOption } from "./FiltersLeadsSection";

function vendedorLabel(v: VendedorOption): string {
  return [v.name, v.lastName].filter(Boolean).join(" ").trim() || "Sin nombre";
}

function VendedorInitials({ name, lastName }: { name: string; lastName: string | null }) {
  const label = `${name?.trim()?.[0] ?? ""}${lastName?.trim()?.[0] ?? ""}`.toUpperCase() || "?";
  return (
    <span
      className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 text-[10px] font-semibold"
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

interface VendedorPickerProps {
  vendedores: VendedorOption[];
  value: string | null;
  onChange: (vendedorId: string | null) => void;
  disabled?: boolean;
}

function VendedorPicker({
  vendedores,
  value,
  onChange,
  disabled = false,
}: VendedorPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = vendedores.find((v) => v.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return vendedores;
    return vendedores.filter((v) => normalizeSearch(vendedorLabel(v)).includes(q));
  }, [vendedores, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative min-w-[220px] w-full sm:w-72">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Elegir vendedor para asignar"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-lg border border-orange-200/70 dark:border-orange-800/50 bg-white dark:bg-[#1e1e1e] px-3 py-2 text-sm text-left text-[#212121] dark:text-white hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-sm hover:shadow-orange-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)]"
      >
        {selected ? (
          <>
            <VendedorInitials name={selected.name} lastName={selected.lastName} />
            <span className="truncate flex-1 font-medium">{vendedorLabel(selected)}</span>
          </>
        ) : (
          <span className="truncate flex-1 text-[#9e9e9e] dark:text-[#888]">
            Elegir vendedor…
          </span>
        )}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={16}
          className={`shrink-0 text-[#616161] dark:text-[#b0b0b0] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="clientes-pop-in absolute z-30 mt-1 w-full rounded-lg border border-orange-200/60 dark:border-orange-900/50 bg-white dark:bg-[#121212] shadow-xl shadow-orange-500/10 overflow-hidden">
          <div className="relative border-b border-[#e0e0e0] dark:border-[#3a3a3a] p-2">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#616161] dark:text-[#b0b0b0]">
              <HugeiconsIcon icon={Search01Icon} size={16} />
            </span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full rounded-md border-0 bg-transparent pl-8 pr-2 py-1.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none"
              aria-label="Buscar vendedor"
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-[#616161] dark:text-[#b0b0b0]">
                No hay vendedores que coincidan.
              </li>
            ) : (
              filtered.map((v) => {
                const isSelected = v.id === value;
                return (
                  <li key={v.id} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(v.id);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-orange-50 dark:hover:bg-orange-900/20 ${
                        isSelected
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200"
                          : "text-[#212121] dark:text-white"
                      }`}
                    >
                      <VendedorInitials name={v.name} lastName={v.lastName} />
                      <span className="truncate">{vendedorLabel(v)}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

interface AssignLeadsBarProps {
  vendedores: VendedorOption[];
  assignToVendedorId: string | null;
  onAssignToVendedorChange: (vendedorId: string | null) => void;
  selectedLeadCount: number;
  onAssign: () => void;
  isAssigning: boolean;
  onCancelAssign: () => void;
}

export default function AssignLeadsBar({
  vendedores,
  assignToVendedorId,
  onAssignToVendedorChange,
  selectedLeadCount,
  onAssign,
  isAssigning,
  onCancelAssign,
}: AssignLeadsBarProps) {
  const selectedVendedor = vendedores.find((v) => v.id === assignToVendedorId);
  const hasSelection = selectedLeadCount > 0;
  const canSubmit = hasSelection && assignToVendedorId != null && !isAssigning;

  return (
    <div
      className={`rounded-xl border px-4 py-3 transition-[background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
        hasSelection
          ? "border-orange-400/70 dark:border-orange-600/50 bg-orange-500/15 dark:bg-orange-500/20 shadow-sm shadow-orange-500/15"
          : "border-orange-200/60 dark:border-orange-900/40 bg-gradient-to-r from-orange-500/[0.08] to-transparent dark:from-orange-500/10"
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-[transform,background-color,color] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
              hasSelection
                ? "bg-orange-500 text-white scale-110 shadow-sm shadow-orange-500/40"
                : "bg-orange-500/15 text-orange-700 dark:text-orange-300"
            }`}
            aria-hidden="true"
          >
            <HugeiconsIcon icon={UserAdd01Icon} size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#212121] dark:text-white">
              Asignar a un vendedor
            </p>
            <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
              {hasSelection
                ? `${selectedLeadCount} ${selectedLeadCount === 1 ? "cliente seleccionado" : "clientes seleccionados"}. Elige el vendedor y confirma.`
                : "Marca clientes en la tabla. Esto no filtra la lista: asigna dueño."}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:shrink-0">
          <VendedorPicker
            vendedores={vendedores}
            value={assignToVendedorId}
            onChange={onAssignToVendedorChange}
            disabled={isAssigning}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAssign}
              disabled={!canSubmit}
              className="inline-flex flex-1 sm:flex-none items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-px active:scale-[0.97] shadow-sm shadow-orange-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 transition-[transform,background-color,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)]"
            >
              {isAssigning
                ? "Asignando…"
                : selectedVendedor
                  ? `Asignar${hasSelection ? ` ${selectedLeadCount}` : ""}`
                  : "Asignar"}
            </button>
            {(hasSelection || assignToVendedorId) && (
              <button
                type="button"
                onClick={onCancelAssign}
                disabled={isAssigning}
                className="clientes-pop-in inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0] hover:bg-white dark:hover:bg-[#2a2a2a] active:scale-[0.97] disabled:opacity-50 transition-transform duration-150"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
