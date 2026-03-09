"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@apollo/client";
import {
  TECH_FOLLOW_UP_TASK_QUERY,
  type TechFollowUpTaskVariables,
  type TechFollowUpTaskResponse,
} from "kadesh/components/profile/sales/queries";
import { formatDateShort } from "kadesh/utils/format-date";

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
    <AnimatePresence>
      <motion.div
        key="followup-detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="followup-detail-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a]">
            <h4 className="text-lg font-bold text-[#212121] dark:text-[#ffffff]">
              Detalle del seguimiento
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
                No se encontró el seguimiento.
              </p>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Fecha programada
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                    {formatDateShort(task.scheduledDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Estado
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                    {task.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Prioridad
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                    {task.priority}
                  </p>
                </div>
                {task.businessLead && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                      Empresa
                    </p>
                    <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                      {task.businessLead.businessName}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Notas
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff] whitespace-pre-wrap break-words">
                    {task.notes ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Registrado
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                    {formatDateShort(task.createdAt)}
                  </p>
                </div>
                {task.updatedAt && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                      Actualizado
                    </p>
                    <p className="text-sm text-[#212121] dark:text-[#ffffff]">
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
  );
}
