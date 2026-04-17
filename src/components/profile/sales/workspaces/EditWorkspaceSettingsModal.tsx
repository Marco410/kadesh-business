"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon, DragDropVerticalIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { ConfirmModal, PaletteColorPicker } from "kadesh/components/shared";
import {
  CREATE_SAAS_WORKSPACE_CRM_STATUS_MUTATION,
  DELETE_SAAS_WORKSPACE_CRM_STATUS_MUTATION,
  SAAS_WORKSPACE_DETAIL_QUERY,
  SAAS_WORKSPACES_QUERY,
  UPDATE_SAAS_WORKSPACE_CRM_STATUS_MUTATION,
  UPDATE_SAAS_WORKSPACE_MUTATION,
  type CreateSaasWorkspaceCrmStatusMutation,
  type CreateSaasWorkspaceCrmStatusVariables,
  type DeleteSaasWorkspaceCrmStatusMutation,
  type DeleteSaasWorkspaceCrmStatusVariables,
  type SaasWorkspaceCrmStatus,
  type SaasWorkspaceDetailResponse,
  type SaasWorkspaceDetailVariables,
  type SaasWorkspacesResponse,
  type UpdateSaasWorkspaceCrmStatusMutation,
  type UpdateSaasWorkspaceCrmStatusVariables,
  type UpdateSaasWorkspaceMutation,
  type UpdateSaasWorkspaceVariables,
} from "kadesh/components/profile/sales/workspaces/queries";
import { useWorkspaceContext } from "kadesh/components/profile/sales/workspaces/WorkspaceContext";

const inputClassName =
  "w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#252525] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

type StatusRow = Pick<
  SaasWorkspaceCrmStatus,
  "id" | "name" | "color" | "order" | "key" | "isDefault"
>;

function normalizeHexForPicker(raw: string): string {
  let s = raw.trim();
  if (!s.startsWith("#")) s = `#${s}`;
  if (/^#([0-9a-fA-F]{3})$/.test(s)) {
    const [, short] = s.match(/^#([0-9a-fA-F]{3})$/) ?? [];
    if (short && short.length === 3) {
      const [r, g, b] = short.split("");
      s = `#${r}${r}${g}${g}${b}${b}`;
    }
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(s)) return "#6B7280";
  return s.toLowerCase();
}

/** Clave interna tipo `CUSTOM_MI_ESTADO` a partir del nombre visible (ASCII, mayúsculas). */
function nameToCustomCrmKey(displayName: string): string {
  const n = displayName.normalize("NFD").replace(/\p{M}/gu, "");
  const slug = n
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  const base = slug.length > 0 ? slug : "ESTADO";
  return `CUSTOM_${base}`;
}

function uniqueCrmKeyAmongRows(baseKey: string, rows: StatusRow[]): string {
  const keys = new Set(rows.map((r) => r.key));
  if (!keys.has(baseKey)) return baseKey;
  return `${baseKey}_${Date.now()}`;
}

/** Reordena quitando `fromId` e insertándolo antes o después de la fila `toId` (sin `fromId` en el array). */
function reorderStatusDropAt(
  rows: StatusRow[],
  fromId: string,
  toId: string,
  insertBefore: boolean
): StatusRow[] {
  if (fromId === toId) return rows;
  const fromIdx = rows.findIndex((r) => r.id === fromId);
  const toIdx = rows.findIndex((r) => r.id === toId);
  if (fromIdx === -1 || toIdx === -1) return rows;
  const dragged = rows[fromIdx]!;
  const rest = rows.filter((r) => r.id !== fromId);
  const toIdxInRest = rest.findIndex((r) => r.id === toId);
  if (toIdxInRest === -1) return rows;
  const insertAt = insertBefore ? toIdxInRest : toIdxInRest + 1;
  rest.splice(insertAt, 0, dragged);
  return rest.map((r, i) => ({ ...r, order: i + 1 }));
}

const CRM_STATUS_DND_MIME = "application/x-kadesh-saas-crm-status-id";

export interface EditWorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string | null;
}

export default function EditWorkspaceSettingsModal({
  isOpen,
  onClose,
  workspaceId,
}: EditWorkspaceSettingsModalProps) {
  const [name, setName] = useState("");
  const [showActivities, setShowActivities] = useState(true);
  const [showProposals, setShowProposals] = useState(true);
  const [showFollowUpTasks, setShowFollowUpTasks] = useState(true);
  const [statusRows, setStatusRows] = useState<StatusRow[]>([]);
  const [addStatusModalOpen, setAddStatusModalOpen] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#6b7280");
  const [deletingStatusId, setDeletingStatusId] = useState<string | null>(null);
  const [statusPendingDelete, setStatusPendingDelete] = useState<StatusRow | null>(null);
  const [draggingReorderId, setDraggingReorderId] = useState<string | null>(null);
  const [reorderHoverRowId, setReorderHoverRowId] = useState<string | null>(null);
  const [reorderInsertBefore, setReorderInsertBefore] = useState<boolean | null>(null);
  const [reorderSaving, setReorderSaving] = useState(false);

  const reorderDropHintRef = useRef<{ hoverId: string | null; insertBefore: boolean }>({
    hoverId: null,
    insertBefore: true,
  });

  const statusRowsRef = useRef(statusRows);
  statusRowsRef.current = statusRows;

  const { data: wsData, loading: wsLoading, refetch: refetchWorkspaceDetail } = useQuery<
    SaasWorkspaceDetailResponse,
    SaasWorkspaceDetailVariables
  >(SAAS_WORKSPACE_DETAIL_QUERY, {
    variables: { where: { id: workspaceId ?? "" } },
    skip: !isOpen || !workspaceId,
    fetchPolicy: "network-only",
  });

  const { refetch: refetchWorkspacesList } = useQuery<SaasWorkspacesResponse>(
    SAAS_WORKSPACES_QUERY,
    { skip: true }
  );

  const { refetchWorkspaceBoardData } = useWorkspaceContext();

  const ws = wsData?.saasWorkspace ?? null;

  const reorderLiveMessage = useMemo(() => {
    if (!draggingReorderId) return "";
    if (!reorderHoverRowId || reorderInsertBefore == null) {
      return "Suelta sobre una fila para elegir la posición.";
    }
    const target = statusRows.find((r) => r.id === reorderHoverRowId);
    const label = target?.name?.trim() || target?.key || "esta fila";
    return reorderInsertBefore
      ? `Se colocará antes de «${label}».`
      : `Se colocará después de «${label}».`;
  }, [
    draggingReorderId,
    reorderHoverRowId,
    reorderInsertBefore,
    statusRows,
  ]);

  useEffect(() => {
    if (!isOpen || !workspaceId) return;
    const w = wsData?.saasWorkspace;
    if (!w) return;
    setName(w.name ?? "");
    setShowActivities(w.showActivities ?? true);
    setShowProposals(w.showProposals ?? true);
    setShowFollowUpTasks(w.showFollowUpTasks ?? true);
    const rows = (w.crmStatuses ?? [])
      .filter((s) => !s.isArchived)
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        id: s.id,
        name: s.name,
        color: normalizeHexForPicker(s.color),
        order: s.order,
        key: s.key,
        isDefault: Boolean(s.isDefault),
      }));
    setStatusRows(rows);
  }, [isOpen, workspaceId, wsData?.saasWorkspace]);

  useEffect(() => {
    if (!isOpen) {
      setAddStatusModalOpen(false);
      setNewStatusName("");
      setNewStatusColor("#6b7280");
      setStatusPendingDelete(null);
      setDraggingReorderId(null);
      setReorderHoverRowId(null);
      setReorderInsertBefore(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!draggingReorderId) {
      setReorderHoverRowId(null);
      setReorderInsertBefore(null);
      reorderDropHintRef.current = { hoverId: null, insertBefore: true };
    }
  }, [draggingReorderId]);

  const [updateWorkspace, { loading: savingWorkspace }] = useMutation<
    UpdateSaasWorkspaceMutation,
    UpdateSaasWorkspaceVariables
  >(UPDATE_SAAS_WORKSPACE_MUTATION);

  const [updateCrmStatus, { loading: savingCrm }] = useMutation<
    UpdateSaasWorkspaceCrmStatusMutation,
    UpdateSaasWorkspaceCrmStatusVariables
  >(UPDATE_SAAS_WORKSPACE_CRM_STATUS_MUTATION);

  const [createCrmStatus, { loading: creatingCrmStatus }] = useMutation<
    CreateSaasWorkspaceCrmStatusMutation,
    CreateSaasWorkspaceCrmStatusVariables
  >(CREATE_SAAS_WORKSPACE_CRM_STATUS_MUTATION);

  const [deleteCrmStatus] = useMutation<
    DeleteSaasWorkspaceCrmStatusMutation,
    DeleteSaasWorkspaceCrmStatusVariables
  >(DELETE_SAAS_WORKSPACE_CRM_STATUS_MUTATION);

  const saving = savingWorkspace || savingCrm;
  const isDeletingStatus = deletingStatusId !== null;

  const persistCrmStatusOrders = useCallback(
    async (rows: StatusRow[]) => {
      if (!workspaceId) return;
      setReorderSaving(true);
      try {
        await Promise.all(
          rows.map((r) =>
            updateCrmStatus({
              variables: {
                where: { id: r.id },
                data: {
                  name: r.name.trim() || r.name,
                  color: normalizeHexForPicker(r.color),
                  order: r.order,
                },
              },
            })
          )
        );
        await Promise.all([refetchWorkspaceDetail(), refetchWorkspaceBoardData()]);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "No se pudo guardar el orden de los estados";
        sileo.error({ title: msg });
        await refetchWorkspaceDetail();
      } finally {
        setReorderSaving(false);
      }
    },
    [
      workspaceId,
      updateCrmStatus,
      refetchWorkspaceDetail,
      refetchWorkspaceBoardData,
    ]
  );

  function handleReorderDrop(fromId: string, toId: string, insertBefore: boolean) {
    if (fromId === toId) return;
    const prev = statusRowsRef.current;
    const reordered = reorderStatusDropAt(prev, fromId, toId, insertBefore);
    if (reordered === prev) return;
    setStatusRows(reordered);
    statusRowsRef.current = reordered;
    void persistCrmStatusOrders(reordered);
  }

  function updateStatusRow(id: string, patch: Partial<Pick<StatusRow, "name" | "color">>) {
    setStatusRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId) return;
    const trimmed = name.trim();
    if (!trimmed) {
      sileo.warning({ title: "Escribe un nombre para el espacio" });
      return;
    }

    try {
      await updateWorkspace({
        variables: {
          where: { id: workspaceId },
          data: {
            name: trimmed,
            showActivities,
            showProposals,
            showFollowUpTasks,
          },
        },
      });

      await Promise.all(
        statusRows.map((r) =>
          updateCrmStatus({
            variables: {
              where: { id: r.id },
              data: {
                name: r.name.trim() || r.name,
                color: normalizeHexForPicker(r.color),
                order: r.order,
              },
            },
          })
        )
      );

      await Promise.all([
        refetchWorkspacesList(),
        refetchWorkspaceDetail(),
      ]);

      sileo.success({ title: "Espacio actualizado" });
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "No se pudo guardar el espacio de trabajo";
      sileo.error({ title: msg });
    }
  }

  function openDeleteStatusConfirm(row: StatusRow) {
    if (row.isDefault) {
      sileo.warning({ title: "No se puede eliminar el estado por defecto del espacio" });
      return;
    }
    setStatusPendingDelete(row);
  }

  function closeDeleteStatusConfirm() {
    if (deletingStatusId !== null) return;
    setStatusPendingDelete(null);
  }

  async function handleConfirmDeleteStatus() {
    const row = statusPendingDelete;
    if (!row || !workspaceId) return;

    setDeletingStatusId(row.id);
    try {
      const res = await deleteCrmStatus({
        variables: { where: { id: row.id } },
      });
      if (!res.data?.deleteSaasWorkspaceCrmStatus?.id) {
        sileo.error({ title: "No se pudo eliminar el estado" });
        return;
      }
      await Promise.all([
        refetchWorkspacesList(),
        refetchWorkspaceDetail(),
        refetchWorkspaceBoardData(),
      ]);
      sileo.success({ title: "Estado eliminado" });
      setStatusPendingDelete(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "No se pudo eliminar el estado CRM";
      sileo.error({ title: msg });
    } finally {
      setDeletingStatusId(null);
    }
  }

  const deleteStatusConfirmMessage =
    statusPendingDelete == null
      ? ""
      : `¿Eliminar el estado «${
          statusPendingDelete.name.trim() || statusPendingDelete.key
        }»? Si lo eliminas, las tareas, seguimientos y propuestas que estén en este estado pasarán automáticamente a «${
          statusRows.find((r) => r.isDefault)?.name?.trim() || "el estado por defecto"
        }».`;

  function openAddStatusModal() {
    setNewStatusName("");
    setNewStatusColor("#6b7280");
    setAddStatusModalOpen(true);
  }

  function closeAddStatusModal() {
    setAddStatusModalOpen(false);
  }

  const previewNewStatusKey =
    newStatusName.trim().length > 0 ? nameToCustomCrmKey(newStatusName.trim()) : "";

  async function handleConfirmAddCrmStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId) return;
    const trimmed = newStatusName.trim();
    if (!trimmed) {
      sileo.warning({ title: "Escribe un nombre para el estado" });
      return;
    }
    const maxOrder =
      statusRows.length === 0 ? 0 : Math.max(...statusRows.map((r) => r.order));
    const nextOrder = maxOrder + 1;
    const baseKey = nameToCustomCrmKey(trimmed);
    const key = uniqueCrmKeyAmongRows(baseKey, statusRows);
    const color = normalizeHexForPicker(newStatusColor);
    try {
      await createCrmStatus({
        variables: {
          data: {
            name: trimmed,
            color,
            key,
            order: nextOrder,
            isDefault: false,
            workspace: { connect: { id: workspaceId } },
          },
        },
      });
      await Promise.all([refetchWorkspacesList(), refetchWorkspaceDetail()]);
      sileo.success({ title: "Estado CRM añadido" });
      closeAddStatusModal();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "No se pudo crear el estado CRM";
      sileo.error({ title: msg });
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="ews-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="ews-dialog"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="fixed inset-0 z-[125] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-lg max-h-[min(90vh,720px)] overflow-y-auto rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-workspace-settings-title"
        >
          <div className="sticky top-0 z-10 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-5 py-4">
            <h2
              id="edit-workspace-settings-title"
              className="text-lg font-semibold text-[#212121] dark:text-white"
            >
              Editar espacio de trabajo
            </h2>
            <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e]">
              Nombre, visibilidad del tablero y estados CRM (nombre y color).
            </p>
          </div>

          {wsLoading && !ws ? (
            <div className="flex justify-center py-16">
              <span className="size-9 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          ) : !ws ? (
            <p className="p-6 text-sm text-[#616161] dark:text-[#9e9e9e]">
              No se pudo cargar el espacio.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div>
                <label
                  htmlFor="ews-name"
                  className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                >
                  Nombre
                </label>
                <input
                  id="ews-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClassName}
                  autoComplete="off"
                />
              </div>

              <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#181818] p-4 space-y-3">
                <p className="text-sm font-semibold text-[#212121] dark:text-white">
                  Mostrar en este workspace
                </p>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showActivities}
                    onChange={(e) => setShowActivities(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#e0e0e0] dark:border-[#3a3a3a] accent-orange-500"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[#212121] dark:text-white">
                      Tareas
                    </span>
                    <span className="block text-xs text-[#616161] dark:text-[#9e9e9e]">
                      Pestaña y columnas de tareas en el tablero
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showFollowUpTasks}
                    onChange={(e) => setShowFollowUpTasks(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#e0e0e0] dark:border-[#3a3a3a] accent-orange-500"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[#212121] dark:text-white">
                      Seguimientos
                    </span>
                    <span className="block text-xs text-[#616161] dark:text-[#9e9e9e]">
                      Pestaña y columnas de seguimientos
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showProposals}
                    onChange={(e) => setShowProposals(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#e0e0e0] dark:border-[#3a3a3a] accent-orange-500"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[#212121] dark:text-white">
                      Propuestas
                    </span>
                    <span className="block text-xs text-[#616161] dark:text-[#9e9e9e]">
                      Pestaña y columnas de propuestas
                    </span>
                  </span>
                </label>
              </div>

              <div>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#212121] dark:text-white mb-2 sm:mb-1">
                      Estados CRM
                    </p>
                    <p className="text-xs text-[#616161] dark:text-[#9e9e9e]">
                      Agrega estados para categorizar las tareas, seguimientos y propuestas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openAddStatusModal}
                    disabled={
                      wsLoading ||
                      creatingCrmStatus ||
                      saving ||
                      isDeletingStatus ||
                      reorderSaving
                    }
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#e0e0e0] bg-white px-3 py-2 text-sm font-medium text-[#212121] hover:bg-[#f5f5f5] disabled:opacity-60 dark:border-[#3a3a3a] dark:bg-[#252525] dark:text-white dark:hover:bg-[#2a2a2a]"
                  >
                    <HugeiconsIcon icon={Add01Icon} size={18} className="text-orange-500" />
                    Añadir estado
                  </button>
                </div>
                <p id="ews-crm-reorder-live" className="sr-only" aria-live="polite" aria-atomic="true">
                  {reorderLiveMessage}
                </p>
                <ul
                  className="space-y-3"
                  onDragLeave={(e) => {
                    if (!draggingReorderId) return;
                    const rel = e.relatedTarget as Node | null;
                    if (!rel || !e.currentTarget.contains(rel)) {
                      setReorderHoverRowId(null);
                      setReorderInsertBefore(null);
                      reorderDropHintRef.current = { hoverId: null, insertBefore: true };
                    }
                  }}
                >
                  {statusRows.map((row) => (
                    <li
                      key={row.id}
                      onDragOver={(e) => {
                        if (!draggingReorderId) return;
                        if (draggingReorderId === row.id) {
                          setReorderHoverRowId(null);
                          setReorderInsertBefore(null);
                          reorderDropHintRef.current = { hoverId: null, insertBefore: true };
                          return;
                        }
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        const rect = (e.currentTarget as HTMLLIElement).getBoundingClientRect();
                        const before = e.clientY < rect.top + rect.height / 2;
                        setReorderHoverRowId(row.id);
                        setReorderInsertBefore(before);
                        reorderDropHintRef.current = { hoverId: row.id, insertBefore: before };
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromId =
                          e.dataTransfer.getData(CRM_STATUS_DND_MIME) ||
                          e.dataTransfer.getData("text/plain") ||
                          draggingReorderId;
                        if (!fromId) return;
                        const hint = reorderDropHintRef.current;
                        const insertBefore =
                          hint.hoverId === row.id ? hint.insertBefore : true;
                        handleReorderDrop(fromId, row.id, insertBefore);
                        setDraggingReorderId(null);
                        setReorderHoverRowId(null);
                        setReorderInsertBefore(null);
                        reorderDropHintRef.current = { hoverId: null, insertBefore: true };
                      }}
                      className={`relative flex flex-col gap-2 rounded-xl border bg-white p-3 transition-[box-shadow,opacity] sm:flex-row sm:items-center sm:gap-3 dark:bg-[#252525] ${
                        draggingReorderId === row.id
                          ? "border-orange-300/80 opacity-60 dark:border-orange-500/40"
                          : "border-[#e0e0e0] dark:border-[#3a3a3a]"
                      } ${
                        draggingReorderId &&
                        reorderHoverRowId === row.id &&
                        draggingReorderId !== row.id
                          ? "ring-2 ring-orange-500/70 ring-offset-2 ring-offset-white dark:ring-offset-[#252525]"
                          : ""
                      }`}
                    >
                      {draggingReorderId &&
                      reorderHoverRowId === row.id &&
                      draggingReorderId !== row.id &&
                      reorderInsertBefore === true ? (
                        <div
                          className="pointer-events-none absolute left-3 right-3 top-0 z-10 h-1 -translate-y-1/2 rounded-full bg-orange-500 shadow-[0_0_0_1px_rgba(249,115,22,0.35)]"
                          aria-hidden
                        />
                      ) : null}
                      {draggingReorderId &&
                      reorderHoverRowId === row.id &&
                      draggingReorderId !== row.id &&
                      reorderInsertBefore === false ? (
                        <div
                          className="pointer-events-none absolute bottom-0 left-3 right-3 z-10 h-1 translate-y-1/2 rounded-full bg-orange-500 shadow-[0_0_0_1px_rgba(249,115,22,0.35)]"
                          aria-hidden
                        />
                      ) : null}
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Arrastrar para reordenar: ${row.name || row.key}`}
                        draggable={
                          !reorderSaving && !saving && !isDeletingStatus && !wsLoading
                        }
                        onDragStart={(e) => {
                          e.dataTransfer.setData(CRM_STATUS_DND_MIME, row.id);
                          e.dataTransfer.setData("text/plain", row.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDraggingReorderId(row.id);
                        }}
                        onDragEnd={() => {
                          setDraggingReorderId(null);
                          setReorderHoverRowId(null);
                          setReorderInsertBefore(null);
                          reorderDropHintRef.current = { hoverId: null, insertBefore: true };
                        }}
                        className="flex h-10 w-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-transparent text-[#9e9e9e] hover:border-[#e0e0e0] hover:bg-[#f5f5f5] active:cursor-grabbing dark:hover:border-[#3a3a3a] dark:hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <HugeiconsIcon icon={DragDropVerticalIcon} size={20} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        {row.isDefault ? (
                          <p className="text-[11px] font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">
                            Por defecto
                          </p>
                        ) : null}
                        <input
                          value={row.name}
                          onChange={(e) => updateStatusRow(row.id, { name: e.target.value })}
                          disabled={reorderSaving}
                          className={inputClassName}
                          aria-label={`Nombre del estado ${row.key}`}
                        />
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <PaletteColorPicker
                          label=""
                          value={normalizeHexForPicker(row.color)}
                          onChange={(hex) =>
                            updateStatusRow(row.id, { color: hex })
                          }
                          disabled={reorderSaving}
                          ariaLabel={`Color del estado ${row.key}`}
                        />
                        <button
                          type="button"
                          onClick={() => openDeleteStatusConfirm(row)}
                          disabled={
                            row.isDefault ||
                            saving ||
                            isDeletingStatus ||
                            wsLoading ||
                            reorderSaving
                          }
                          title={
                            row.isDefault
                              ? "El estado por defecto no se puede eliminar"
                              : "Eliminar estado"
                          }
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e0e0e0] text-[#616161] hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40 dark:border-[#3a3a3a] dark:text-[#9e9e9e] dark:hover:bg-red-950/40 dark:hover:border-red-900 dark:hover:text-red-400"
                          aria-label={`Eliminar estado ${row.key}`}
                        >
                          {deletingStatusId === row.id ? (
                            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <HugeiconsIcon icon={Delete02Icon} size={18} />
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#e0e0e0] dark:border-[#3a3a3a] pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-[#616161] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || wsLoading || isDeletingStatus || reorderSaving}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {saving ? "Guardando…" : reorderSaving ? "Guardando orden…" : "Guardar cambios"}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>

      {addStatusModalOpen && (
        <>
          <motion.div
            key="ews-add-status-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-black/60"
            onClick={closeAddStatusModal}
            aria-hidden
          />
          <motion.div
            key="ews-add-status-dialog"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-0 z-[135] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ews-add-crm-status-title"
            >
              <form onSubmit={handleConfirmAddCrmStatus} className="p-5 space-y-4">
                <div>
                  <h3
                    id="ews-add-crm-status-title"
                    className="text-lg font-semibold text-[#212121] dark:text-white"
                  >
                    Nuevo estado CRM
                  </h3>
                  <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e]">
                    Nombre y color. La clave interna se arma con el nombre.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="ews-new-crm-name"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    Nombre
                  </label>
                  <input
                    id="ews-new-crm-name"
                    value={newStatusName}
                    onChange={(e) => setNewStatusName(e.target.value)}
                    className={inputClassName}
                    placeholder="Ej. En negociación, Contactado, En desarrollo, etc."
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                <PaletteColorPicker
                  value={normalizeHexForPicker(newStatusColor)}
                  onChange={(hex) => setNewStatusColor(hex)}
                  disabled={creatingCrmStatus || isDeletingStatus || reorderSaving}
                  ariaLabel="Color del nuevo estado CRM"
                />
                <div className="flex justify-end gap-2 border-t border-[#e0e0e0] dark:border-[#3a3a3a] pt-4">
                  <button
                    type="button"
                    onClick={closeAddStatusModal}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-[#616161] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCrmStatus || isDeletingStatus || reorderSaving}
                    className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                  >
                    {creatingCrmStatus ? "Creando…" : "Crear estado"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}

      <ConfirmModal
        isOpen={statusPendingDelete != null}
        onClose={closeDeleteStatusConfirm}
        onConfirm={() => void handleConfirmDeleteStatus()}
        title="Eliminar estado CRM"
        message={deleteStatusConfirmMessage}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={
          statusPendingDelete != null &&
          deletingStatusId === statusPendingDelete.id
        }
        confirmButtonColor="red"
        stackedOverModal
      />
    </AnimatePresence>
  );
}
