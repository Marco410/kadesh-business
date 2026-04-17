"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { ClientLeadAutocomplete } from "kadesh/components/shared";
import {
  CREATE_TECH_FOLLOW_UP_TASK_MUTATION,
  TECH_FOLLOW_UP_TASKS_QUERY,
  type CreateTechFollowUpTaskMutation,
  type CreateTechFollowUpTaskVariables,
  type TechFollowUpTasksVariables,
} from "kadesh/components/profile/sales/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import { workspaceConnectPayload } from "kadesh/components/profile/sales/workspaces/workspace-connect";
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

export interface CreateWorkspaceFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  userId: string;
  defaultStatusCrmId?: string | null;
}

export default function CreateWorkspaceFollowUpModal({
  isOpen,
  onClose,
  workspaceId,
  userId,
  defaultStatusCrmId,
}: CreateWorkspaceFollowUpModalProps) {
  const [leadId, setLeadId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState<string>(FOLLOW_UP_TASK_STATUS.PENDIENTE);
  const [priority, setPriority] = useState<string>(TASK_PRIORITY.MEDIA);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLeadId("");
    setScheduledDate(formatDateForInput(new Date().toISOString()));
    setStatus(FOLLOW_UP_TASK_STATUS.PENDIENTE);
    setPriority(TASK_PRIORITY.MEDIA);
    setNotes("");
  }, [isOpen]);

  const boardWhere: TechFollowUpTasksVariables["where"] = mergeWorkspaceFilter(
    {},
    workspaceId
  );

  const [createTask, { loading }] = useMutation<
    CreateTechFollowUpTaskMutation,
    CreateTechFollowUpTaskVariables
  >(CREATE_TECH_FOLLOW_UP_TASK_MUTATION, {
    refetchQueries: [{ query: TECH_FOLLOW_UP_TASKS_QUERY, variables: { where: boardWhere } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      sileo.success({ title: "Seguimiento programado" });
      onClose();
    },
    onError: (err) =>
      sileo.error({ title: err.message || "No se pudo programar el seguimiento" }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadId.trim()) {
      sileo.warning({ title: "Selecciona un lead" });
      return;
    }
    const statusCrmConnect =
      defaultStatusCrmId != null && defaultStatusCrmId !== ""
        ? { statusCrm: { connect: { id: defaultStatusCrmId } } }
        : {};

    createTask({
      variables: {
        data: {
          scheduledDate:
            scheduledDate || formatDateForInput(new Date().toISOString()),
          status: status || FOLLOW_UP_TASK_STATUS.PENDIENTE,
          priority: priority || TASK_PRIORITY.MEDIA,
          notes: notes.trim() || null,
          businessLead: { connect: { id: leadId.trim() } },
          assignedSeller: { connect: { id: userId } },
          ...workspaceConnectPayload(workspaceId),
          ...statusCrmConnect,
        },
      },
    });
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cwf-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="cwf-dialog"
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
          aria-labelledby="create-ws-followup-title"
        >
          <div className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] px-5 py-4">
            <h2
              id="create-ws-followup-title"
              className="text-lg font-semibold text-[#212121] dark:text-white"
            >
              Programar seguimiento
            </h2>
            <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e]">
              Se registrará dentro del workspace actual.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <ClientLeadAutocomplete
              id="ws-followup-lead"
              userId={userId}
              enabled={isOpen}
              selectedLeadId={leadId || null}
              onSelectedLeadIdChange={(id) => setLeadId(id ?? "")}
              placeholder="Buscar cliente por nombre"
              required
            />

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
                  Estado
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
                placeholder="Notas del seguimiento…"
              />
            </div>

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
                {loading ? "Guardando…" : "Programar"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

