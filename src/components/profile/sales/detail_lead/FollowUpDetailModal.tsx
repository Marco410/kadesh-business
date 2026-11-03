"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@apollo/client";
import {
  TECH_FOLLOW_UP_TASK_QUERY,
  type TechFollowUpTaskVariables,
  type TechFollowUpTaskResponse,
} from "kadesh/components/profile/sales/queries";
import { formatDateShort } from "kadesh/utils/format-date";
import { ModalPortal } from "kadesh/components/shared";

interface FollowUpDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FollowUpDetailModal({
  taskId,
  isOpen,
  onClose,
}: FollowUpDetailModalProps) {
  const { data, loading } = useQuery<
    TechFollowUpTaskResponse,
    TechFollowUpTaskVariables
  >(TECH_FOLLOW_UP_TASK_QUERY, {
    variables: { where: { id: taskId ?? "" } },
    skip: !isOpen || !taskId,
  });

  const task = data?.techFollowUpTask ?? null;

  if (!isOpen) return null;

  return (
    <ModalPortal>
    <AnimatePresence>
      <motion.div data-body-scroll-lock
        key="followup-detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="followup-detail-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden pointer-events-auto border border-dash-line flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-dash-line bg-dash-surface-2">
            <h4 className="text-lg font-bold text-dash-ink">
              Detalle del seguimiento
            </h4>
            <button
              type="button"
              onClick={onClose}
              className="text-2xl font-bold text-dash-muted hover:text-dash-ink dark:hover:text-[#ffffff] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-[#333]"
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
              <p className="text-sm text-dash-muted">
                No se encontró el seguimiento.
              </p>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-dash-muted mb-1">
                    Fecha programada
                  </p>
                  <p className="text-sm text-dash-ink">
                    {formatDateShort(task.scheduledDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-dash-muted mb-1">
                    Estado
                  </p>
                  <p className="text-sm text-dash-ink">
                    {task.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-dash-muted mb-1">
                    Prioridad
                  </p>
                  <p className="text-sm text-dash-ink">
                    {task.priority}
                  </p>
                </div>
                {task.businessLead && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-dash-muted mb-1">
                      Empresa
                    </p>
                    <p className="text-sm text-dash-ink">
                      {task.businessLead.businessName}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-dash-muted mb-1">
                    Notas
                  </p>
                  <p className="text-sm text-dash-ink whitespace-pre-wrap break-words">
                    {task.notes ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-dash-muted mb-1">
                    Registrado
                  </p>
                  <p className="text-sm text-dash-ink">
                    {formatDateShort(task.createdAt)}
                  </p>
                </div>
                {task.updatedAt && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-dash-muted mb-1">
                      Actualizado
                    </p>
                    <p className="text-sm text-dash-ink">
                      {formatDateShort(task.updatedAt)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
    </ModalPortal>
  );
}
