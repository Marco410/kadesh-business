"use client";

import { useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import Link from "next/link";
import { ApolloError } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, DragDropVerticalIcon } from "@hugeicons/core-free-icons";
import type { TechBusinessLeadsResponse } from "kadesh/components/profile/sales/queries";
import { PIPELINE_STATUS } from "kadesh/constants/constans";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { CopyPhoneButton } from "./CopyPhoneButton";
import { getCategoryLabel } from "./helpers/category";
import { pickCanonicalLeadStatus } from "./helpers/canonical-lead-status";
import LeadsPageNav from "./LeadsPageNav";
import type { LeadsPageSize } from "./leadsPagination";

const UNASSIGNED_PIPELINE = "__sin_estado__";
const COLLAPSED_COLUMNS_KEY = "kadesh.leads.kanbanCollapsed";
const COLLAPSED_COLUMNS_EVENT = "kadesh-leads-kanban-collapsed";
const NO_COLLAPSED_COLUMNS: string[] = [];

let collapsedSnapshotRaw: string | null = null;
let collapsedSnapshot: string[] = NO_COLLAPSED_COLUMNS;

function readCollapsedColumns(): string[] {
  try {
    const raw = window.localStorage.getItem(COLLAPSED_COLUMNS_KEY) ?? "";
    if (raw === collapsedSnapshotRaw) return collapsedSnapshot;
    collapsedSnapshotRaw = raw;
    if (!raw) {
      collapsedSnapshot = NO_COLLAPSED_COLUMNS;
      return collapsedSnapshot;
    }
    const parsed = JSON.parse(raw) as unknown;
    collapsedSnapshot = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : NO_COLLAPSED_COLUMNS;
    return collapsedSnapshot;
  } catch {
    return collapsedSnapshot;
  }
}

function subscribeCollapsedColumns(onStoreChange: () => void) {
  window.addEventListener(COLLAPSED_COLUMNS_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(COLLAPSED_COLUMNS_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function writeCollapsedColumns(next: string[]) {
  try {
    const raw = JSON.stringify(next);
    window.localStorage.setItem(COLLAPSED_COLUMNS_KEY, raw);
    collapsedSnapshotRaw = raw;
    collapsedSnapshot = next;
  } catch {
    collapsedSnapshot = next;
  }
  window.dispatchEvent(new Event(COLLAPSED_COLUMNS_EVENT));
}

function toggleCollapsedColumn(status: string) {
  const current = readCollapsedColumns();
  writeCollapsedColumns(
    current.includes(status)
      ? current.filter((item) => item !== status)
      : [...current, status],
  );
}

const PIPELINE_COLUMNS = Object.values(PIPELINE_STATUS);

const PIPELINE_BAR: Record<string, string> = {
  [PIPELINE_STATUS.DETECTADO]: "bg-slate-400",
  [PIPELINE_STATUS.SELECCIONADO]: "bg-blue-500",
  [PIPELINE_STATUS.CONTACTADO]: "bg-indigo-500",
  [PIPELINE_STATUS.SIN_RESPUESTA]: "bg-amber-500",
  [PIPELINE_STATUS.INTERESADO]: "bg-emerald-500",
  [PIPELINE_STATUS.CREANDO_PROYECTO_PROPUESTA]: "bg-sky-500",
  [PIPELINE_STATUS.PROPUESTA_ENVIADA]: "bg-cyan-500",
  [PIPELINE_STATUS.SEGUIMIENTO]: "bg-violet-500",
  [PIPELINE_STATUS.EN_NEGOCIACION]: "bg-orange-500",
  [PIPELINE_STATUS.PROPUESTA_ACEPTADA]: "bg-green-500",
  [PIPELINE_STATUS.PROPUESTA_RECHAZADA]: "bg-red-500",
  [PIPELINE_STATUS.CERRADO_GANADO]: "bg-green-600",
  [PIPELINE_STATUS.CERRADO_PERDIDO]: "bg-red-600",
  [PIPELINE_STATUS.DESCARTADO]: "bg-neutral-400",
};

type LeadItem = TechBusinessLeadsResponse["techBusinessLeads"][number];

type DragState = {
  leadId: string;
  pipeline: string;
  name: string;
};

function pipelineOf(lead: LeadItem, overrides: Record<string, string>): string {
  const override = overrides[lead.id];
  if (override) return override;
  const value = pickCanonicalLeadStatus(lead.status, lead.salesPerson)
    ?.pipelineStatus;
  if (value && PIPELINE_COLUMNS.includes(value as (typeof PIPELINE_COLUMNS)[number])) {
    return value;
  }
  return value || UNASSIGNED_PIPELINE;
}

function shortPipelineLabel(status: string): string {
  if (status === UNASSIGNED_PIPELINE) return "Sin estado";
  return status.replace(/^\d+\s*-\s*/, "");
}

function assigneeLabel(lead: LeadItem): string | null {
  const person =
    pickCanonicalLeadStatus(lead.status, lead.salesPerson)?.salesPerson ??
    lead.salesPerson?.[0];
  if (!person?.name) return null;
  return [person.name, person.lastName].filter(Boolean).join(" ");
}

export default function LeadsKanbanBoard({
  leads,
  loading,
  error,
  totalCount,
  pipelineOverrides,
  onMove,
  selectable = false,
  selectedLeadIds,
  onToggleLead,
  showAssignee = false,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  canMoveLeads = true,
}: {
  leads: LeadItem[];
  loading: boolean;
  error: ApolloError | undefined;
  totalCount: number;
  pipelineOverrides: Record<string, string>;
  onMove: (leadId: string, pipelineStatus: string) => void;
  selectable?: boolean;
  selectedLeadIds?: Set<string>;
  onToggleLead?: (leadId: string) => void;
  showAssignee?: boolean;
  pageSize: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: LeadsPageSize) => void;
  canMoveLeads?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const overPipelineRef = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overPipeline, setOverPipeline] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; name: string } | null>(
    null,
  );
  const collapsedColumns = useSyncExternalStore(
    subscribeCollapsedColumns,
    readCollapsedColumns,
    () => NO_COLLAPSED_COLUMNS,
  );

  const grouped = new Map<string, LeadItem[]>();
  for (const status of PIPELINE_COLUMNS) grouped.set(status, []);
  const extras: string[] = [];
  for (const lead of leads) {
    const status = pipelineOf(lead, pipelineOverrides);
    if (!grouped.has(status)) {
      grouped.set(status, []);
      extras.push(status);
    }
    grouped.get(status)?.push(lead);
  }

  const columns = [
    ...PIPELINE_COLUMNS,
    ...extras.filter((status) => status !== UNASSIGNED_PIPELINE),
    ...(grouped.get(UNASSIGNED_PIPELINE)?.length ? [UNASSIGNED_PIPELINE] : []),
  ];

  const endDrag = (commit: boolean) => {
    const drag = dragRef.current;
    const target = overPipelineRef.current;
    dragRef.current = null;
    overPipelineRef.current = null;
    setDraggingId(null);
    setOverPipeline(null);
    setGhost(null);
    if (!commit || !drag || !target || target === drag.pipeline) return;
    if (!PIPELINE_COLUMNS.includes(target as (typeof PIPELINE_COLUMNS)[number])) return;
    if (readCollapsedColumns().includes(target)) toggleCollapsedColumn(target);
    onMove(drag.leadId, target);
  };

  const trackPointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    const under = document.elementFromPoint(event.clientX, event.clientY);
    const column = under?.closest<HTMLElement>("[data-pipeline]");
    const next = column?.dataset.pipeline ?? null;
    const allowed =
      next && PIPELINE_COLUMNS.includes(next as (typeof PIPELINE_COLUMNS)[number])
        ? next
        : null;
    overPipelineRef.current = allowed;
    setOverPipeline(allowed);
    setGhost({ x: event.clientX, y: event.clientY, name: dragRef.current.name });

    const scroller = scrollerRef.current;
    if (!scroller) return;
    const bounds = scroller.getBoundingClientRect();
    if (event.clientX < bounds.left + 56) scroller.scrollLeft -= 18;
    if (event.clientX > bounds.right - 56) scroller.scrollLeft += 18;
  };

  if (error && leads.length === 0) {
    return (
      <div className="w-full rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        No se pudieron cargar los clientes. Intenta de nuevo más tarde.
      </div>
    );
  }

  if (loading && leads.length === 0) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-80 w-[17rem] shrink-0 animate-pulse rounded-2xl bg-[#ececec] dark:bg-[#2a2a2a]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!loading && leads.length === 0 ? (
        <div className="flex w-full flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-8 py-10 dark:border-gray-800 dark:bg-[#18181b]">
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            No hay clientes en esta vista
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Prueba a cambiar los filtros.
          </div>
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="flex items-start gap-3 overflow-x-auto pb-2"
          aria-busy={loading}
        >
          {columns.map((status) => {
            const cards = grouped.get(status) ?? [];
            const isDropTarget = PIPELINE_COLUMNS.includes(
              status as (typeof PIPELINE_COLUMNS)[number],
            );
            const isOver = overPipeline === status;
            const isCollapsed = collapsedColumns.includes(status);
            const label = shortPipelineLabel(status);
            return (
              <section
                key={status}
                data-pipeline={isDropTarget ? status : undefined}
                className={cn(
                  "flex shrink-0 flex-col overflow-hidden rounded-2xl border bg-[#fafafa] transition-[width] duration-200 dark:bg-[#181818]",
                  isCollapsed ? "w-12" : "w-[17rem]",
                  isOver
                    ? "border-orange-400 ring-2 ring-orange-400/70"
                    : "border-[#e0e0e0] dark:border-[#3a3a3a]",
                )}
              >
                <div className={cn("h-1 w-full", PIPELINE_BAR[status] ?? "bg-neutral-400")} />
                {isCollapsed ? (
                  <button
                    type="button"
                    aria-expanded={false}
                    title={isOver ? "Suelta aquí" : label}
                    aria-label={isOver ? `Soltar en ${label}` : `Mostrar ${label}`}
                    onClick={() => toggleCollapsedColumn(status)}
                    className="flex min-h-11 w-full flex-col items-center gap-3 px-1 py-3"
                  >
                    <span className="rounded-full bg-white px-1.5 py-0.5 text-xs font-semibold tabular-nums text-[#616161] dark:bg-[#252525] dark:text-[#b0b0b0]">
                      {cards.length}
                    </span>
                    <span className="max-h-40 overflow-hidden text-xs font-semibold tracking-wide text-[#212121] [writing-mode:vertical-rl] dark:text-white">
                      {isOver ? "Suelta aquí" : label}
                    </span>
                  </button>
                ) : (
                  <>
                    <header className="flex items-center gap-1 border-b border-[#e8e8e8] py-1 pr-1 pl-3 dark:border-[#2a2a2a]">
                      <h3
                        className="min-w-0 flex-1 truncate text-sm font-semibold text-[#212121] dark:text-white"
                        title={label}
                      >
                        {label}
                      </h3>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold tabular-nums text-[#616161] dark:bg-[#252525] dark:text-[#b0b0b0]">
                        {cards.length}
                      </span>
                      <button
                        type="button"
                        aria-expanded
                        aria-label={`Ocultar ${label}`}
                        title={`Ocultar ${label}`}
                        onClick={() => toggleCollapsedColumn(status)}
                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f5f5f5] dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a]"
                      >
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          size={18}
                          className="-rotate-90"
                        />
                      </button>
                    </header>
                    <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto p-2">
                  {cards.length === 0 ? (
                    <p className="px-2 py-6 text-center text-xs text-[#9e9e9e] dark:text-[#777]">
                      {isOver ? "Suelta aquí" : "Sin clientes"}
                    </p>
                  ) : (
                    cards.map((lead) => (
                      <article
                        key={lead.id}
                        className={cn(
                          "rounded-xl border border-[#e8e8e8] bg-white p-2.5 shadow-sm dark:border-[#333] dark:bg-[#1e1e1e]",
                          draggingId === lead.id && "pointer-events-none opacity-40",
                          selectedLeadIds?.has(lead.id) &&
                            "ring-2 ring-orange-400/80",
                        )}
                      >
                        <div className="flex items-start gap-1">
                          {canMoveLeads ? (
                          <button
                            type="button"
                            className="inline-flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-[#9e9e9e] hover:bg-[#f5f5f5] active:cursor-grabbing dark:text-[#777] dark:hover:bg-[#2a2a2a]"
                            aria-label={`Mover ${lead.businessName || "cliente"}`}
                            aria-keyshortcuts="ArrowLeft ArrowRight"
                            disabled={Boolean(pipelineOverrides[lead.id])}
                            onPointerDown={(event) => {
                              if (event.button !== 0 || pipelineOverrides[lead.id]) return;
                              event.currentTarget.setPointerCapture(event.pointerId);
                              dragRef.current = {
                                leadId: lead.id,
                                pipeline: pipelineOf(lead, pipelineOverrides),
                                name: lead.businessName || "Cliente",
                              };
                              setDraggingId(lead.id);
                              setGhost({
                                x: event.clientX,
                                y: event.clientY,
                                name: lead.businessName || "Cliente",
                              });
                            }}
                            onPointerMove={trackPointer}
                            onPointerUp={() => endDrag(true)}
                            onPointerCancel={() => endDrag(false)}
                            onKeyDown={(event) => {
                              const order = PIPELINE_COLUMNS;
                              const current = pipelineOf(lead, pipelineOverrides);
                              const index = order.indexOf(
                                current as (typeof PIPELINE_COLUMNS)[number],
                              );
                              if (event.key === "ArrowRight" && index >= 0 && index < order.length - 1) {
                                event.preventDefault();
                                onMove(lead.id, order[index + 1]);
                              }
                              if (event.key === "ArrowLeft" && index > 0) {
                                event.preventDefault();
                                onMove(lead.id, order[index - 1]);
                              }
                            }}
                          >
                            <HugeiconsIcon icon={DragDropVerticalIcon} size={18} />
                          </button>
                          ) : null}
                          <div className="min-w-0 flex-1 pt-1">
                            <div className="flex items-start gap-2">
                              {selectable ? (
                                <input
                                  type="checkbox"
                                  checked={selectedLeadIds?.has(lead.id) ?? false}
                                  onChange={() => onToggleLead?.(lead.id)}
                                  className="mt-1 rounded border-[#e0e0e0] text-orange-500 focus:ring-orange-500 dark:border-[#3a3a3a]"
                                  aria-label={`Seleccionar ${lead.businessName}`}
                                />
                              ) : null}
                              <Link
                                href={Routes.panelLead(lead.id)}
                                className="min-w-0 flex-1 text-sm font-semibold text-[#212121] hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                              >
                                {lead.businessName || "Sin nombre"}
                              </Link>
                            </div>
                            <p className="mt-1 truncate text-xs text-[#616161] dark:text-[#b0b0b0]">
                              {getCategoryLabel(lead.category)}
                            </p>
                            {lead.phone ? (
                              <p className="mt-1 flex items-center gap-1 text-xs">
                                <a
                                  href={`tel:${lead.phone.replace(/\s/g, "")}`}
                                  className="text-orange-500 hover:underline dark:text-orange-400"
                                >
                                  {lead.phone}
                                </a>
                                <CopyPhoneButton phone={lead.phone} />
                              </p>
                            ) : null}
                            <p className="mt-1 truncate text-xs text-[#9e9e9e] dark:text-[#777]">
                              {[lead.city, lead.state].filter(Boolean).join(" · ") || "Sin ubicación"}
                            </p>
                            {showAssignee && assigneeLabel(lead) ? (
                              <p className="mt-1 truncate text-xs text-[#616161] dark:text-[#b0b0b0]">
                                {assigneeLabel(lead)}
                              </p>
                            ) : null}
                            {pipelineOverrides[lead.id] ? (
                              <p className="mt-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                                Guardando…
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
                  </>
                )}
              </section>
            );
          })}
        </div>
      )}
      <LeadsPageNav
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        loading={loading}
      />
      {ghost ? (
        <div
          className="pointer-events-none fixed z-50 max-w-[14rem] truncate rounded-lg bg-[#212121] px-3 py-2 text-sm font-medium text-white shadow-lg"
          style={{ left: ghost.x + 12, top: ghost.y + 12 }}
        >
          {ghost.name}
        </div>
      ) : null}
    </div>
  );
}
