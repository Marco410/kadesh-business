"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import Link from "next/link";
import {
  TECH_TASKS_QUERY,
  UPDATE_TECH_TASK_MUTATION,
  type TechTasksResponse,
  type TechTasksVariables,
  type UpdateTechTaskMutation,
  type UpdateTechTaskVariables,
} from "kadesh/components/profile/sales/queries";
import {
  SAAS_WORKSPACE_DETAIL_QUERY,
  type SaasWorkspaceCrmStatus,
  type SaasWorkspaceDetailResponse,
  type SaasWorkspaceDetailVariables,
} from "kadesh/components/profile/sales/workspaces/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import { Autocomplete, RequiredFieldMark, type AutocompleteOption } from "kadesh/components/shared";
import HiddenInWorkspaceSwitch from "./HiddenInWorkspaceSwitch";
import { Routes } from "kadesh/core/routes";
import { TASK_PRIORITY } from "kadesh/constants/constans";

const TASK_PRIORITY_OPTIONS = Object.values(TASK_PRIORITY);

function formatDateForInput(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateInputToIso(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  return new Date(`${dateStr}T12:00:00`).toISOString();
}

const inputClassName =
  "w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#252525] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

function memberDisplayName(m: {
  name: string;
  lastName: string | null;
  email: string | null;
}): string {
  const full = [m.name, m.lastName ?? ""].filter(Boolean).join(" ").trim();
  return m.email ? `${full} (${m.email})` : full;
}

type TechTaskRow = TechTasksResponse["techTasks"][number];

export interface EditWorkspaceTechTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  task: TechTaskRow | null;
  crmStatuses: SaasWorkspaceCrmStatus[];
  defaultCrmStatusId: string | null;
  canReassignAssignee?: boolean;
}

export default function EditWorkspaceTechTaskModal({
  isOpen,
  onClose,
  workspaceId,
  task,
  crmStatuses,
  defaultCrmStatusId,
  canReassignAssignee = false,
}: EditWorkspaceTechTaskModalProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [result, setResult] = useState("");
  const [comments, setComments] = useState("");
  const [statusCrmId, setStatusCrmId] = useState("");
  const [hiddenInWorkspace, setHiddenInWorkspace] = useState(false);
  const [responsibleUserId, setResponsibleUserId] = useState("");

  const { data: wsDetail, loading: wsMembersLoading } = useQuery<
    SaasWorkspaceDetailResponse,
    SaasWorkspaceDetailVariables
  >(SAAS_WORKSPACE_DETAIL_QUERY, {
    variables: { where: { id: workspaceId } },
    skip: !isOpen || !workspaceId,
    fetchPolicy: "cache-and-network",
  });

  const memberOptions = useMemo<AutocompleteOption[]>(() => {
    const members = wsDetail?.saasWorkspace?.members ?? [];
    const opts = members.map((m) => ({
      id: m.id,
      label: memberDisplayName(m),
    }));
    const resp = task?.responsible;
    if (resp && !opts.some((o) => o.id === resp.id)) {
      const label = [resp.name, resp.lastName ?? ""].filter(Boolean).join(" ").trim();
      opts.unshift({ id: resp.id, label: label || resp.id });
    }
    return opts;
  }, [wsDetail?.saasWorkspace?.members, task?.responsible]);

  useEffect(() => {
    if (!isOpen || !task) return;
    setTitle(task.title ?? "");
    setStartDate(formatDateForInput(task.startDate));
    setDueDate(task.dueDate ? formatDateForInput(task.dueDate) : "");
    setPriority(task.priority);
    setResult(task.result ?? "");
    setComments(task.comments ?? "");
    setStatusCrmId(task.statusCrm?.id ?? defaultCrmStatusId ?? crmStatuses[0]?.id ?? "");
    setHiddenInWorkspace(task.hiddenInWorkspace === true);
    setResponsibleUserId(task.responsible?.id ?? "");
  }, [isOpen, task, defaultCrmStatusId, crmStatuses]);

  const boardWhere: TechTasksVariables["where"] = mergeWorkspaceFilter({}, workspaceId);

  const [updateTask, { loading }] = useMutation<
    UpdateTechTaskMutation,
    UpdateTechTaskVariables
  >(UPDATE_TECH_TASK_MUTATION, {
    refetchQueries: [{ query: TECH_TASKS_QUERY, variables: { where: boardWhere } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      sileo.success({ title: "Tarea actualizada" });
      onClose();
    },
    onError: (err) =>
      sileo.error({ title: err.message || "No se pudo actualizar la tarea" }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;
    if (canReassignAssignee && !responsibleUserId.trim()) {
      sileo.warning({ title: "Selecciona un responsable" });
      return;
    }
    const statusPayload =
      statusCrmId.trim() !== ""
        ? { statusCrm: { connect: { id: statusCrmId.trim() } } }
        : {};
    const assignPayload =
      canReassignAssignee && responsibleUserId.trim()
        ? { responsible: { connect: { id: responsibleUserId.trim() } } }
        : {};
    updateTask({
      variables: {
        where: { id: task.id },
        data: {
          title: title.trim() || null,
          startDate: dateInputToIso(startDate),
          dueDate: dueDate.trim() !== "" ? dateInputToIso(dueDate) : null,
          priority: priority || TASK_PRIORITY.MEDIA,
          result: result.trim(),
          comments: comments.trim(),
          hiddenInWorkspace,
          ...assignPayload,
          ...statusPayload,
        },
      },
    });
  }

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="ewt-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="ewt-dialog"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="modal fixed inset-0 z-[125] pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-lg rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-ws-tech-task-title"
        >
          <div className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] px-5 py-4">
            <h2
              id="edit-ws-tech-task-title"
              className="text-lg font-semibold text-[#212121] dark:text-white"
            >
              Editar tarea
            </h2>
            {task.businessLead && (
              <Link
                href={Routes.panelLead(task.businessLead.id)}
                className="mt-2 inline-block text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
              >
                Ir al lead: {task.businessLead.businessName}
              </Link>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Estado CRM <RequiredFieldMark />
              </label>
              <select
                value={statusCrmId}
                onChange={(e) => setStatusCrmId(e.target.value)}
                className={inputClassName}
                required
              >
                {crmStatuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Título <RequiredFieldMark />
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={inputClassName}
              />
            </div>

            {canReassignAssignee ? (
              <Autocomplete
                id="edit-ws-tech-task-responsible"
                label="Responsable"
                value={responsibleUserId}
                options={memberOptions}
                onSelect={(option) => setResponsibleUserId(option?.id ?? "")}
                placeholder="Buscar miembro del workspace"
                required
                loading={wsMembersLoading}
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                  Responsable
                </label>
                <div
                  className={`${inputClassName} text-[#616161] dark:text-[#b0b0b0]`}
                  aria-readonly
                >
                  {task.responsible
                    ? [task.responsible.name, task.responsible.lastName ?? ""]
                        .filter(Boolean)
                        .join(" ")
                        .trim() || "—"
                    : "Sin asignar"}
                </div>
                <p className="mt-1 text-xs text-[#616161] dark:text-[#9e9e9e]">
                  Solo un administrador de empresa puede cambiar al responsable.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputClassName}
              >
                {TASK_PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                  Fecha de la tarea <RequiredFieldMark />
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClassName}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                  Fecha límite
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Resultado o cierre
              </label>
              <input
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className={inputClassName}
                placeholder="Opcional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Comentarios
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className={inputClassName}
                rows={3}
              />
            </div>

            <HiddenInWorkspaceSwitch
              checked={hiddenInWorkspace}
              onCheckedChange={setHiddenInWorkspace}
              disabled={loading}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-[#616161] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {loading ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
