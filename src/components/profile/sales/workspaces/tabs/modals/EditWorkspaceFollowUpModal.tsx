"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import Link from "next/link";
import {
  TECH_FOLLOW_UP_TASKS_QUERY,
  UPDATE_TECH_FOLLOW_UP_TASK_MUTATION,
  type TechFollowUpTasksResponse,
  type TechFollowUpTasksVariables,
  type UpdateTechFollowUpTaskMutation,
  type UpdateTechFollowUpTaskVariables,
} from "kadesh/components/profile/sales/queries";
import type { SaasWorkspaceCrmStatus } from "kadesh/components/profile/sales/workspaces/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import HiddenInWorkspaceSwitch from "./HiddenInWorkspaceSwitch";
import { Routes } from "kadesh/core/routes";
import { FOLLOW_UP_TASK_STATUS, TASK_PRIORITY } from "kadesh/constants/constans";

const FOLLOW_UP_STATUS_OPTIONS = Object.values(FOLLOW_UP_TASK_STATUS);
const TASK_PRIORITY_OPTIONS = Object.values(TASK_PRIORITY);

function formatDateForInput(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const inputClassName =
  "w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#252525] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

type TaskRow = TechFollowUpTasksResponse["techFollowUpTasks"][number];

export interface EditWorkspaceFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  task: TaskRow | null;
  crmStatuses: SaasWorkspaceCrmStatus[];
  defaultCrmStatusId: string | null;
}

export default function EditWorkspaceFollowUpModal({
  isOpen,
  onClose,
  workspaceId,
  task,
  crmStatuses,
  defaultCrmStatusId,
}: EditWorkspaceFollowUpModalProps) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [notes, setNotes] = useState("");
  const [statusCrmId, setStatusCrmId] = useState("");
  const [hiddenInWorkspace, setHiddenInWorkspace] = useState(false);

  useEffect(() => {
    if (!isOpen || !task) return;
    setScheduledDate(formatDateForInput(task.scheduledDate));
    setStatus(task.status);
    setPriority(task.priority);
    setNotes(task.notes ?? "");
    setStatusCrmId(task.statusCrm?.id ?? defaultCrmStatusId ?? crmStatuses[0]?.id ?? "");
    setHiddenInWorkspace(task.hiddenInWorkspace === true);
  }, [isOpen, task, defaultCrmStatusId, crmStatuses]);

  const boardWhere: TechFollowUpTasksVariables["where"] = mergeWorkspaceFilter(
    {},
    workspaceId
  );

  const [updateTask, { loading }] = useMutation<
    UpdateTechFollowUpTaskMutation,
    UpdateTechFollowUpTaskVariables
  >(UPDATE_TECH_FOLLOW_UP_TASK_MUTATION, {
    refetchQueries: [{ query: TECH_FOLLOW_UP_TASKS_QUERY, variables: { where: boardWhere } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      sileo.success({ title: "Seguimiento actualizado" });
      onClose();
    },
    onError: (err) =>
      sileo.error({ title: err.message || "No se pudo actualizar el seguimiento" }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;
    const statusPayload =
      statusCrmId.trim() !== ""
        ? { statusCrm: { connect: { id: statusCrmId.trim() } } }
        : {};
    updateTask({
      variables: {
        where: { id: task.id },
        data: {
          scheduledDate: scheduledDate || formatDateForInput(new Date().toISOString()),
          status: status || FOLLOW_UP_TASK_STATUS.PENDIENTE,
          priority: priority || TASK_PRIORITY.MEDIA,
          notes: notes.trim() || null,
          hiddenInWorkspace,
          ...statusPayload,
        },
      },
    });
  }

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="ewf-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="ewf-dialog"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="fixed inset-0 z-[125] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-lg rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-ws-followup-title"
        >
          <div className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] px-5 py-4">
            <h2
              id="edit-ws-followup-title"
              className="text-lg font-semibold text-[#212121] dark:text-white"
            >
              Editar seguimiento
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
                Estado CRM
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
                Fecha programada
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className={inputClassName}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                  Estado (legado)
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClassName}
                >
                  {FOLLOW_UP_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
