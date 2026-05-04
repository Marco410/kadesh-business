"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@apollo/client";
import {
  TECH_SALES_ACTIVITY_QUERY,
  type TechSalesActivityVariables,
  type TechSalesActivityResponse,
} from "kadesh/components/profile/sales/queries";
import { formatDateShort } from "kadesh/utils/format-date";

interface ActivityDetailModalProps {
  activityId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityDetailModal({
  activityId,
  isOpen,
  onClose,
}: ActivityDetailModalProps) {
  const { data, loading } = useQuery<
    TechSalesActivityResponse,
    TechSalesActivityVariables
  >(TECH_SALES_ACTIVITY_QUERY, {
    variables: { where: { id: activityId ?? "" } },
    skip: !isOpen || !activityId,
  });

  const activity = data?.techSalesActivity ?? null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="activity-detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="activity-detail-content"
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
              Detalle de actividad
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
            ) : !activity ? (
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                No se encontró la actividad.
              </p>
            ) : (
              <>
                {activity.title?.trim() ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                      Título
                    </p>
                    <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                      {activity.title}
                    </p>
                  </div>
                ) : null}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Fecha y hora
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                    {formatDateShort(activity.activityDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Tipo
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                    {activity.type}
                  </p>
                </div>
                {activity.dueDate ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                      Fecha límite
                    </p>
                    <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                      {formatDateShort(activity.dueDate)}
                    </p>
                  </div>
                ) : null}
                {activity.priority ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                      Prioridad
                    </p>
                    <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                      {activity.priority}
                    </p>
                  </div>
                ) : null}
                {activity.assignedSeller ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                      Responsable
                    </p>
                    <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                      {[activity.assignedSeller.name, activity.assignedSeller.lastName ?? ""]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </div>
                ) : null}
                {activity.businessLead && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                      Empresa
                    </p>
                    <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                      {activity.businessLead.businessName}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Resultado de la interacción
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff] whitespace-pre-wrap break-words">
                    {activity.result ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Comentarios
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff] whitespace-pre-wrap break-words">
                    {activity.comments ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Registrado
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                    {formatDateShort(activity.createdAt)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
