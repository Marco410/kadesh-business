"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { formatDateShort } from "kadesh/utils/format-date";
import type { SaasWorkspaceCrmStatus } from "kadesh/components/profile/sales/workspaces/queries";
import type {
  TechFollowUpTasksResponse,
  TechProposalsResponse,
  TechSalesActivitiesResponse,
} from "kadesh/components/profile/sales/queries";
import AssigneeAvatar from "kadesh/components/profile/sales/workspaces/AssigneeAvatar";
import { filterByCrmStatusColumn } from "kadesh/components/profile/sales/workspaces/filter-by-crm-status";
import { setWorkspaceCrmDragData } from "kadesh/components/profile/sales/workspaces/workspace-crm-drag";
import WorkspaceColumn from "kadesh/components/profile/sales/workspaces/tabs/WorkspaceColumn";
import StatusPill from "kadesh/components/profile/sales/workspaces/tabs/StatusPill";
import CardSkeleton from "kadesh/components/profile/sales/workspaces/tabs/CardSkeleton";

type ActivityRow = TechSalesActivitiesResponse["techSalesActivities"][number];
type TaskRow = TechFollowUpTasksResponse["techFollowUpTasks"][number];
type ProposalRow = TechProposalsResponse["techProposals"][number];

export type WorkspaceCrmEntityTab = "act" | "tasks" | "props";

export type WorkspaceCrmBoardViewTab = WorkspaceCrmEntityTab | "hidden";

const emptyLineClass =
  "rounded-xl border border-dashed border-neutral-300 bg-white py-18 text-center text-sm font-medium text-neutral-600 shadow-sm dark:border-[#404040] dark:bg-[#1e1e1e]/60 dark:text-[#9e9e9e]";

const cardShellClass =
  "flex w-full gap-0 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:border-orange-400/50 hover:shadow-md dark:border-[#333] dark:bg-[#1e1e1e] dark:hover:border-orange-500/35 text-left";

const dragHandleClass =
  "flex shrink-0 cursor-grab touch-none items-center justify-center border-r border-neutral-200 bg-neutral-100 px-1.5 text-neutral-500 hover:bg-neutral-200/80 hover:text-neutral-700 active:cursor-grabbing dark:border-[#333] dark:bg-[#222] dark:text-[#9e9e9e] dark:hover:bg-[#2a2a2a] dark:hover:text-[#b0b0b0]";

const cardBodyClass =
  "min-w-0 flex-1 p-3 text-left outline-none hover:bg-orange-500/[0.03] dark:hover:bg-orange-500/5";

function isHiddenInWorkspace(
  row: { hiddenInWorkspace?: boolean | null }
): boolean {
  return row.hiddenInWorkspace === true;
}

export interface WorkspaceCrmStatusColumnProps {
  status: SaasWorkspaceCrmStatus;
  defaultStatusColumnId: string | null;
  entityTab: WorkspaceCrmEntityTab;
  showHiddenOnly?: boolean;
  activities: ActivityRow[];
  tasks: TaskRow[];
  proposals: ProposalRow[];
  loading: boolean;
  dropHighlight: boolean;
  onColumnDragEnter: () => void;
  onColumnDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onColumnDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onBoardDragEnd: () => void;
  onEditActivity: (a: ActivityRow) => void;
  onEditTask: (t: TaskRow) => void;
  onEditProposal: (p: ProposalRow) => void;
}

export default function WorkspaceCrmStatusColumn({
  status,
  defaultStatusColumnId,
  entityTab,
  showHiddenOnly = false,
  activities,
  tasks,
  proposals,
  loading,
  dropHighlight,
  onColumnDragEnter,
  onColumnDragLeave,
  onColumnDrop,
  onBoardDragEnd,
  onEditActivity,
  onEditTask,
  onEditProposal,
}: WorkspaceCrmStatusColumnProps) {
  const byHidden = <T extends { hiddenInWorkspace?: boolean | null }>(rows: T[]) =>
    showHiddenOnly ? rows.filter(isHiddenInWorkspace) : rows.filter((r) => !isHiddenInWorkspace(r));

  const colActivities = byHidden(
    filterByCrmStatusColumn(activities, status.id, defaultStatusColumnId)
  );
  const colTasks = byHidden(
    filterByCrmStatusColumn(tasks, status.id, defaultStatusColumnId)
  );
  const colProposals = byHidden(
    filterByCrmStatusColumn(proposals, status.id, defaultStatusColumnId)
  );

  const hiddenInColumnCount =
    colActivities.length + colTasks.length + colProposals.length;

  const count = showHiddenOnly
    ? hiddenInColumnCount
    : entityTab === "act"
      ? colActivities.length
      : entityTab === "tasks"
        ? colTasks.length
        : colProposals.length;

  const emptyCopy = showHiddenOnly
    ? "No hay registros ocultos en este estado."
    : entityTab === "act"
      ? "No hay actividades en este estado."
      : entityTab === "tasks"
        ? "No hay seguimientos en este estado."
        : "No hay propuestas en este estado.";

  const dropZoneClass = dropHighlight
    ? "rounded-xl bg-orange-50 ring-2 ring-orange-400/70 ring-inset dark:bg-orange-500/10 dark:ring-orange-500/45"
    : "";

  return (
    <WorkspaceColumn
      title={status.name}
      count={count}
      accentColor={status.color}
      className="w-[min(100%,300px)] shrink-0"
    >
      {loading ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </>
      ) : (
        <div
          className={`flex min-h-[120px] flex-col gap-3 transition-colors ${dropZoneClass}`}
          onDragEnter={onColumnDragEnter}
          onDragLeave={onColumnDragLeave}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }}
          onDrop={onColumnDrop}
        >
          {showHiddenOnly ? (
            hiddenInColumnCount === 0 ? (
              <p className={emptyLineClass}>{emptyCopy}</p>
            ) : (
              <>
                {colActivities.map((a) => (
                  <div key={`act-${a.id}`} className={cardShellClass}>
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        setWorkspaceCrmDragData(e.dataTransfer, { entity: "act", id: a.id });
                      }}
                      onDragEnd={onBoardDragEnd}
                      className={dragHandleClass}
                      aria-label="Arrastrar a otra columna"
                    >
                      <HugeiconsIcon icon={DragDropVerticalIcon} size={18} />
                    </button>
                    <button
                      type="button"
                      className={cardBodyClass}
                      onClick={() => onEditActivity(a)}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                        Actividad
                      </p>
                      <p className="text-sm font-semibold text-[#212121] dark:text-white line-clamp-2">
                        {a.type}
                        {a.businessLead ? ` · ${a.businessLead.businessName}` : ""}
                      </p>
                      {a.businessLead && (
                        <Link
                          href={Routes.panelLead(a.businessLead.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 inline-block text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          Abrir lead
                        </Link>
                      )}
                      <p className="mt-1 text-xs text-[#616161] dark:text-[#9e9e9e]">
                        {formatDateShort(a.activityDate)}
                        {a.result ? ` · ${a.result}` : ""}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <StatusPill label={a.statusCrm?.name ?? "Actividad"} />
                        {a.assignedSeller && (
                          <AssigneeAvatar
                            name={a.assignedSeller.name}
                            lastName={a.assignedSeller.lastName}
                            imageUrl={a.assignedSeller.profileImage?.url}
                          />
                        )}
                      </div>
                    </button>
                  </div>
                ))}
                {colTasks.map((t) => (
                  <div key={`task-${t.id}`} className={cardShellClass}>
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        setWorkspaceCrmDragData(e.dataTransfer, { entity: "tasks", id: t.id });
                      }}
                      onDragEnd={onBoardDragEnd}
                      className={dragHandleClass}
                      aria-label="Arrastrar a otra columna"
                    >
                      <HugeiconsIcon icon={DragDropVerticalIcon} size={18} />
                    </button>
                    <button
                      type="button"
                      className={cardBodyClass}
                      onClick={() => onEditTask(t)}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                        Seguimiento
                      </p>
                      <p className="text-sm font-semibold text-[#212121] dark:text-white line-clamp-2">
                        {(t.notes?.trim() || "Seguimiento").slice(0, 120)}
                        {t.businessLead ? ` · ${t.businessLead.businessName}` : ""}
                      </p>
                      {t.businessLead && (
                        <Link
                          href={Routes.panelLead(t.businessLead.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 inline-block text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          Abrir lead
                        </Link>
                      )}
                      <p className="mt-1 text-xs text-[#616161] dark:text-[#9e9e9e]">
                        {formatDateShort(t.scheduledDate)} · Prioridad {t.priority}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <StatusPill label={t.statusCrm?.name ?? t.status} />
                        {t.assignedSeller && (
                          <AssigneeAvatar
                            name={t.assignedSeller.name}
                            lastName={t.assignedSeller.lastName}
                            imageUrl={t.assignedSeller.profileImage?.url}
                          />
                        )}
                      </div>
                    </button>
                  </div>
                ))}
                {colProposals.map((p) => (
                  <div key={`prop-${p.id}`} className={cardShellClass}>
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        setWorkspaceCrmDragData(e.dataTransfer, { entity: "props", id: p.id });
                      }}
                      onDragEnd={onBoardDragEnd}
                      className={dragHandleClass}
                      aria-label="Arrastrar a otra columna"
                    >
                      <HugeiconsIcon icon={DragDropVerticalIcon} size={18} />
                    </button>
                    <button
                      type="button"
                      className={cardBodyClass}
                      onClick={() => onEditProposal(p)}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                        Propuesta
                      </p>
                      <p className="text-sm font-semibold text-[#212121] dark:text-white line-clamp-2">
                        {p.product?.trim() || "Propuesta"}
                        {p.businessLead ? ` · ${p.businessLead.businessName}` : ""}
                      </p>
                      {p.businessLead && (
                        <Link
                          href={Routes.panelLead(p.businessLead.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 inline-block text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          Abrir lead
                        </Link>
                      )}
                      <p className="mt-1 text-xs text-[#616161] dark:text-[#9e9e9e]">
                        {formatDateShort(p.sentDate)}
                        {p.amount != null ? ` · $${p.amount.toLocaleString("es-MX")}` : ""}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <StatusPill label={p.statusCrm?.name ?? p.status} />
                        {p.assignedSeller && (
                          <AssigneeAvatar
                            name={p.assignedSeller.name}
                            lastName={p.assignedSeller.lastName}
                            imageUrl={p.assignedSeller.profileImage?.url}
                          />
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </>
            )
          ) : entityTab === "act" ? (
            colActivities.length === 0 ? (
              <p className={emptyLineClass}>{emptyCopy}</p>
            ) : (
              colActivities.map((a) => (
                <div key={a.id} className={cardShellClass}>
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      setWorkspaceCrmDragData(e.dataTransfer, { entity: "act", id: a.id });
                    }}
                    onDragEnd={onBoardDragEnd}
                    className={dragHandleClass}
                    aria-label="Arrastrar a otra columna"
                  >
                    <HugeiconsIcon icon={DragDropVerticalIcon} size={18} />
                  </button>
                  <button
                    type="button"
                    className={cardBodyClass}
                    onClick={() => onEditActivity(a)}
                  >
                    <p className="text-sm font-semibold text-[#212121] dark:text-white line-clamp-2">
                      {a.type}
                      {a.businessLead ? ` · ${a.businessLead.businessName}` : ""}
                    </p>
                    {a.businessLead && (
                      <Link
                        href={Routes.panelLead(a.businessLead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 inline-block text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                      >
                        Abrir lead
                      </Link>
                    )}
                    <p className="mt-1 text-xs text-[#616161] dark:text-[#9e9e9e]">
                      {formatDateShort(a.activityDate)}
                      {a.result ? ` · ${a.result}` : ""}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <StatusPill label={a.statusCrm?.name ?? "Actividad"} />
                      {a.assignedSeller && (
                        <AssigneeAvatar
                          name={a.assignedSeller.name}
                          lastName={a.assignedSeller.lastName}
                          imageUrl={a.assignedSeller.profileImage?.url}
                        />
                      )}
                    </div>
                  </button>
                </div>
              ))
            )
          ) : entityTab === "tasks" ? (
            colTasks.length === 0 ? (
              <p className={emptyLineClass}>{emptyCopy}</p>
            ) : (
              colTasks.map((t) => (
                <div key={t.id} className={cardShellClass}>
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      setWorkspaceCrmDragData(e.dataTransfer, { entity: "tasks", id: t.id });
                    }}
                    onDragEnd={onBoardDragEnd}
                    className={dragHandleClass}
                    aria-label="Arrastrar a otra columna"
                  >
                    <HugeiconsIcon icon={DragDropVerticalIcon} size={18} />
                  </button>
                  <button
                    type="button"
                    className={cardBodyClass}
                    onClick={() => onEditTask(t)}
                  >
                    <p className="text-sm font-semibold text-[#212121] dark:text-white line-clamp-2">
                      {(t.notes?.trim() || "Seguimiento").slice(0, 120)}
                      {t.businessLead ? ` · ${t.businessLead.businessName}` : ""}
                    </p>
                    {t.businessLead && (
                      <Link
                        href={Routes.panelLead(t.businessLead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 inline-block text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                      >
                        Abrir lead
                      </Link>
                    )}
                    <p className="mt-1 text-xs text-[#616161] dark:text-[#9e9e9e]">
                      {formatDateShort(t.scheduledDate)} · Prioridad {t.priority}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <StatusPill label={t.statusCrm?.name ?? t.status} />
                      {t.assignedSeller && (
                        <AssigneeAvatar
                          name={t.assignedSeller.name}
                          lastName={t.assignedSeller.lastName}
                          imageUrl={t.assignedSeller.profileImage?.url}
                        />
                      )}
                    </div>
                  </button>
                </div>
              ))
            )
          ) : colProposals.length === 0 ? (
            <p className={emptyLineClass}>{emptyCopy}</p>
          ) : (
            colProposals.map((p) => (
              <div key={p.id} className={cardShellClass}>
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    setWorkspaceCrmDragData(e.dataTransfer, { entity: "props", id: p.id });
                  }}
                  onDragEnd={onBoardDragEnd}
                  className={dragHandleClass}
                  aria-label="Arrastrar a otra columna"
                >
                  <HugeiconsIcon icon={DragDropVerticalIcon} size={18} />
                </button>
                <button
                  type="button"
                  className={cardBodyClass}
                  onClick={() => onEditProposal(p)}
                >
                  <p className="text-sm font-semibold text-[#212121] dark:text-white line-clamp-2">
                    {p.product?.trim() || "Propuesta"}
                    {p.businessLead ? ` · ${p.businessLead.businessName}` : ""}
                  </p>
                  {p.businessLead && (
                    <Link
                      href={Routes.panelLead(p.businessLead.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 inline-block text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      Abrir lead
                    </Link>
                  )}
                  <p className="mt-1 text-xs text-[#616161] dark:text-[#9e9e9e]">
                    {formatDateShort(p.sentDate)}
                    {p.amount != null ? ` · $${p.amount.toLocaleString("es-MX")}` : ""}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <StatusPill label={p.statusCrm?.name ?? p.status} />
                    {p.assignedSeller && (
                      <AssigneeAvatar
                        name={p.assignedSeller.name}
                        lastName={p.assignedSeller.lastName}
                        imageUrl={p.assignedSeller.profileImage?.url}
                      />
                    )}
                  </div>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </WorkspaceColumn>
  );
}
