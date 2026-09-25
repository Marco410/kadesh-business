"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@apollo/client";
import {
  TECH_TASKS_QUERY,
  type TechTasksResponse,
  type TechTasksVariables,
} from "kadesh/components/profile/sales/queries";
import { formatDateShort } from "kadesh/utils/format-date";
import { ModalPortal } from "kadesh/components/shared";

interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
        {label}
      </p>
      <div className="text-sm text-[#212121] dark:text-[#ffffff] whitespace-pre-wrap break-words">
        {children}
      </div>
    </div>
  );
}

/** Detalle de solo lectura de una tarea (`TechTask`) abierta desde el calendario. */
export default function TaskDetailModal({ taskId, isOpen, onClose }: TaskDetailModalProps) {
  const { data, loading } = useQuery<TechTasksResponse, TechTasksVariables>(TECH_TASKS_QUERY, {
    variables: { where: { id: { equals: taskId ?? "" } } },
    skip: !isOpen || !taskId,
  });

  const task = data?.techTasks?.[0] ?? null;

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <AnimatePresence>
        <motion.div
          key="task-detail-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        />
        <motion.div
          key="task-detail-content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
        >
          <div
            className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a]">
              <h4 className="text-lg font-bold text-[#212121] dark:text-[#ffffff]">
                Detalle de la tarea
              </h4>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl font-bold text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-[#333]"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="animate-spin size-8 border-2 border-orange-500 border-t-transparent rounded-full" />
                </div>
              ) : !task ? (
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                  No se encontró la tarea.
                </p>
              ) : (
                <>
                  <Field label="Título">{task.title || "Sin título"}</Field>
                  <Field label="Inicio">{formatDateShort(task.startDate)}</Field>
                  {task.dueDate ? (
                    <Field label="Fecha límite">{formatDateShort(task.dueDate)}</Field>
                  ) : null}
                  <Field label="Prioridad">{task.priority}</Field>
                  {task.statusCrm ? <Field label="Estado">{task.statusCrm.name}</Field> : null}
                  {task.businessLead ? (
                    <Field label="Empresa">{task.businessLead.businessName}</Field>
                  ) : null}
                  {task.responsible ? (
                    <Field label="Responsable">
                      {[task.responsible.name, task.responsible.lastName].filter(Boolean).join(" ")}
                    </Field>
                  ) : null}
                  <Field label="Resultado">{task.result || "—"}</Field>
                  <Field label="Comentarios">{task.comments || "—"}</Field>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  );
}
