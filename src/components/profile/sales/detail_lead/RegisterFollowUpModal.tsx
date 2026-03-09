"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation } from "@apollo/client";
import {
  TECH_FOLLOW_UP_TASKS_QUERY,
  TECH_FOLLOW_UP_TASKS_COUNT_QUERY,
  CREATE_TECH_FOLLOW_UP_TASK_MUTATION,
  UPDATE_TECH_FOLLOW_UP_TASK_MUTATION,
  type TechFollowUpTasksVariables,
  type TechFollowUpTasksResponse,
  type CreateTechFollowUpTaskVariables,
  type CreateTechFollowUpTaskMutation,
  type UpdateTechFollowUpTaskVariables,
  type UpdateTechFollowUpTaskMutation,
} from "kadesh/components/profile/sales/queries";
import {
  FOLLOW_UP_TASK_STATUS,
  TASK_PRIORITY,
} from "kadesh/components/profile/sales/constants";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import FollowUpDetailModal from "./FollowUpDetailModal";

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

interface RegisterFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  leadId: string;
  userId: string;
}

export default function RegisterFollowUpModal({
  isOpen,
  onClose,
  onSuccess,
  leadId,
  userId,
}: RegisterFollowUpModalProps) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState<string>(FOLLOW_UP_TASK_STATUS.PENDIENTE);
  const [priority, setPriority] = useState<string>(TASK_PRIORITY.MEDIA);
  const [notes, setNotes] = useState("");

  const tasksWhere: TechFollowUpTasksVariables["where"] = {
    AND: [
      {
        assignedSeller: { id: { equals: userId } },
        businessLead: { id: { equals: leadId } },
      },
    ],
  };

  const { data: tasksData, loading: tasksLoading } = useQuery<
    TechFollowUpTasksResponse,
    TechFollowUpTasksVariables
  >(TECH_FOLLOW_UP_TASKS_QUERY, {
    variables: { where: tasksWhere },
    skip: !isOpen || !leadId || !userId,
    fetchPolicy: "network-only",
  });

  const [createTask, { loading: creating }] = useMutation<
    CreateTechFollowUpTaskMutation,
    CreateTechFollowUpTaskVariables
  >(CREATE_TECH_FOLLOW_UP_TASK_MUTATION, {
    refetchQueries: [
      { query: TECH_FOLLOW_UP_TASKS_QUERY, variables: { where: tasksWhere } },
      { query: TECH_FOLLOW_UP_TASKS_COUNT_QUERY, variables: { where: tasksWhere } },
    ],
  });

  const [updateTask, { loading: updating }] = useMutation<
    UpdateTechFollowUpTaskMutation,
    UpdateTechFollowUpTaskVariables
  >(UPDATE_TECH_FOLLOW_UP_TASK_MUTATION, {
    refetchQueries: [
      { query: TECH_FOLLOW_UP_TASKS_QUERY, variables: { where: tasksWhere } },
      { query: TECH_FOLLOW_UP_TASKS_COUNT_QUERY, variables: { where: tasksWhere } },
    ],
  });

  const tasks = tasksData?.techFollowUpTasks ?? [];

  type TaskItem = (typeof tasks)[number];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const submitting = creating || updating;
  const isEditing = editingTask != null;

  useEffect(() => {
    if (isOpen) {
      setScheduledDate(formatDateForInput(new Date().toISOString()));
      setStatus(FOLLOW_UP_TASK_STATUS.PENDIENTE);
      setPriority(TASK_PRIORITY.MEDIA);
      setNotes("");
      setSelectedId(null);
      setEditingTask(null);
    }
  }, [isOpen]);

  const fillFormForEdit = (t: TaskItem) => {
    setEditingTask(t);
    setSelectedId(null);
    setScheduledDate(formatDateForInput(t.scheduledDate));
    setStatus(t.status);
    setPriority(t.priority);
    setNotes(t.notes ?? "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId && !isEditing) {
      sileo.warning({
        title: "Debes iniciar sesión para programar un seguimiento",
      });
      return;
    }
    try {
      if (isEditing && editingTask) {
        await updateTask({
          variables: {
            where: { id: editingTask.id },
            data: {
              scheduledDate:
                scheduledDate || formatDateForInput(new Date().toISOString()),
              status: status || FOLLOW_UP_TASK_STATUS.PENDIENTE,
              priority: priority || TASK_PRIORITY.MEDIA,
              notes: notes.trim() || null,
            },
          },
        });
        sileo.success({ title: "Seguimiento actualizado" });
        setEditingTask(null);
        setScheduledDate(formatDateForInput(new Date().toISOString()));
        setStatus(FOLLOW_UP_TASK_STATUS.PENDIENTE);
        setPriority(TASK_PRIORITY.MEDIA);
        setNotes("");
      } else {
        await createTask({
          variables: {
            data: {
              scheduledDate:
                scheduledDate || formatDateForInput(new Date().toISOString()),
              status: status || FOLLOW_UP_TASK_STATUS.PENDIENTE,
              priority: priority || TASK_PRIORITY.MEDIA,
              notes: notes.trim() || undefined,
              businessLead: { connect: { id: leadId } },
              assignedSeller: { connect: { id: userId } },
            },
          },
        });
        sileo.success({ title: "Seguimiento programado" });
        onSuccess?.();
      }
    } catch {
      sileo.error({
        title: isEditing
          ? "No se pudo actualizar el seguimiento"
          : "No se pudo programar el seguimiento",
        description: "Intenta de nuevo más tarde.",
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start p-6 pb-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
                <h3 className="text-xl font-bold text-[#212121] dark:text-[#ffffff] pr-4">
                  Programar seguimiento
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] transition-colors flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
                  disabled={submitting}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <div className="px-6 pb-4 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-2">
                  Seguimientos programados
                </p>
                {tasksLoading ? (
                  <div className="flex justify-center py-6">
                    <span className="animate-spin size-8 border-2 border-orange-500 border-t-transparent rounded-full" />
                  </div>
                ) : tasks.length === 0 ? (
                  <p className="text-sm text-[#616161] dark:text-[#b0b0b0] py-4">
                    Aún no hay seguimientos para este lead.
                  </p>
                ) : (
                  <div className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] overflow-hidden">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#f5f5f5] dark:bg-[#2a2a2a] border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
                          <th className="text-left px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
                            Fecha programada
                          </th>
                          <th className="text-left px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
                            Estado
                          </th>
                          <th className="text-left px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
                            Prioridad
                          </th>
                          <th className="text-left px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap max-w-[140px]">
                            Notas
                          </th>
                          <th className="text-right px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap w-[100px]">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((t) => (
                          <tr
                            key={t.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedId(t.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedId(t.id);
                              }
                            }}
                            className={`border-b border-[#e0e0e0] dark:border-[#3a3a3a] hover:bg-[#fafafa] dark:hover:bg-[#252525] cursor-pointer transition-colors ${
                              editingTask?.id === t.id
                                ? "bg-orange-50 dark:bg-orange-950/30 ring-inset ring-2 ring-orange-500/50"
                                : ""
                            }`}
                          >
                            <td className="px-3 py-2 text-[#616161] dark:text-[#b0b0b0] whitespace-nowrap">
                              {formatDateShort(t.scheduledDate)}
                            </td>
                            <td className="px-3 py-2 text-[#212121] dark:text-[#ffffff]">
                              {t.status}
                            </td>
                            <td className="px-3 py-2 text-[#212121] dark:text-[#ffffff]">
                              {t.priority}
                            </td>
                            <td
                              className="px-3 py-2 text-[#616161] dark:text-[#b0b0b0] max-w-[140px] truncate"
                              title={t.notes ?? undefined}
                            >
                              {t.notes ?? "—"}
                            </td>
                            <td
                              className="px-3 py-2 text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => fillFormForEdit(t)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-[#ffffff] text-xs font-medium hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <FollowUpDetailModal
                taskId={selectedId}
                isOpen={!!selectedId}
                onClose={() => setSelectedId(null)}
              />

              <div className="border-t border-[#e0e0e0] dark:border-[#3a3a3a] pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-3 px-6">
                  {isEditing ? "Editar seguimiento" : "Nueva programación"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="followup-scheduledDate"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    Fecha programada <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="followup-scheduledDate"
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="followup-status"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    Estado
                  </label>
                  <select
                    id="followup-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {FOLLOW_UP_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="followup-priority"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    Prioridad
                  </label>
                  <select
                    id="followup-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {TASK_PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="followup-notes"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    Notas
                  </label>
                  <textarea
                    id="followup-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Notas del seguimiento..."
                    className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y min-h-[80px]"
                  />
                </div>

                <div className="flex flex-row justify-end gap-3 pt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="px-4 py-2.5 border-2 border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] font-semibold rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(null);
                        setScheduledDate(formatDateForInput(new Date().toISOString()));
                        setStatus(FOLLOW_UP_TASK_STATUS.PENDIENTE);
                        setPriority(TASK_PRIORITY.MEDIA);
                        setNotes("");
                      }}
                      disabled={submitting}
                      className="px-4 py-2.5 border-2 border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] font-semibold rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar edición
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Guardando..."
                      : isEditing
                        ? "Guardar cambios"
                        : "Programar seguimiento"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
