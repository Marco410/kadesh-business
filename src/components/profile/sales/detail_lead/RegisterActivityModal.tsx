"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation } from "@apollo/client";
import {
  TECH_SALES_ACTIVITIES_QUERY,
  TECH_SALES_ACTIVITIES_COUNT_QUERY,
  CREATE_TECH_SALES_ACTIVITY_MUTATION,
  type TechSalesActivitiesVariables,
  type TechSalesActivitiesResponse,
  type CreateTechSalesActivityVariables,
  type CreateTechSalesActivityMutation,
} from "kadesh/components/profile/sales/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import { workspaceConnectPayload } from "kadesh/components/profile/sales/workspaces/workspace-connect";
import { useWorkspaceContext } from "kadesh/components/profile/sales/workspaces/WorkspaceContext";
import { SALES_ACTIVITY_TYPE } from "kadesh/constants/constans";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import ActivityDetailModal from "./ActivityDetailModal";

const ACTIVITY_TYPE_OPTIONS = Object.values(SALES_ACTIVITY_TYPE);

function formatDateTimeLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

function dateTimeLocalToISO(value: string): string {
  if (!value) return new Date().toISOString();
  return new Date(value).toISOString();
}



interface RegisterActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  leadId: string;
  userId: string;
}

export default function RegisterActivityModal({
  isOpen,
  onClose,
  onSuccess,
  leadId,
  userId,
}: RegisterActivityModalProps) {
  const { currentWorkspaceId } = useWorkspaceContext();
  const [type, setType] = useState<string>(SALES_ACTIVITY_TYPE.LLAMADA);
  const [activityDate, setActivityDate] = useState("");
  const [result, setResult] = useState("");
  const [comments, setComments] = useState("");

  const activitiesWhere: TechSalesActivitiesVariables["where"] =
    mergeWorkspaceFilter(
      {
        AND: [
          {
            assignedSeller: { id: { equals: userId } },
            businessLead: { id: { equals: leadId } },
          },
        ],
      },
      currentWorkspaceId
    );

  const { data: activitiesData, loading: activitiesLoading } = useQuery<
    TechSalesActivitiesResponse,
    TechSalesActivitiesVariables
  >(TECH_SALES_ACTIVITIES_QUERY, {
    variables: { where: activitiesWhere },
    skip: !isOpen || !leadId || !userId,
    fetchPolicy: "network-only",
  });

  const [createActivity, { loading: submitting }] = useMutation<
    CreateTechSalesActivityMutation,
    CreateTechSalesActivityVariables
  >(CREATE_TECH_SALES_ACTIVITY_MUTATION, {
    refetchQueries: [
      { query: TECH_SALES_ACTIVITIES_QUERY, variables: { where: activitiesWhere } },
      { query: TECH_SALES_ACTIVITIES_COUNT_QUERY, variables: { where: activitiesWhere } },
    ],
  });

  const activities = activitiesData?.techSalesActivities ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setType(SALES_ACTIVITY_TYPE.LLAMADA);
      setActivityDate(formatDateTimeLocal(new Date()));
      setResult("");
      setComments("");
      setSelectedId(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      sileo.warning({ title: "Debes iniciar sesión para registrar actividad" });
      return;
    }
    try {
      await createActivity({
        variables: {
          data: {
            type,
            activityDate: dateTimeLocalToISO(activityDate),
            result: result.trim() || null,
            comments: comments.trim() || null,
            businessLead: { connect: { id: leadId } },
            assignedSeller: { connect: { id: userId } },
            ...workspaceConnectPayload(currentWorkspaceId),
          },
        },
      });
      sileo.success({ title: "Actividad registrada" });

      onSuccess?.();
    } catch {
      sileo.error({
        title: "No se pudo registrar la actividad",
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
                  Registrar actividad
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
                  Actividades registradas
                </p>
                {activitiesLoading ? (
                  <div className="flex justify-center py-6">
                    <span className="animate-spin size-8 border-2 border-orange-500 border-t-transparent rounded-full" />
                  </div>
                ) : activities.length === 0 ? (
                  <p className="text-sm text-[#616161] dark:text-[#b0b0b0] py-4">
                    Aún no hay actividades para este lead.
                  </p>
                ) : (
                  <div className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] overflow-hidden">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#f5f5f5] dark:bg-[#2a2a2a] border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
                          <th className="text-left px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
                            Fecha
                          </th>
                          <th className="text-left px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
                            Tipo
                          </th>
                          <th className="text-left px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap max-w-[120px]">
                            Resultado
                          </th>
                          <th className="text-left px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap max-w-[140px]">
                            Comentarios
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((a) => (
                          <tr
                            key={a.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedId(a.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedId(a.id);
                              }
                            }}
                            className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] hover:bg-[#fafafa] dark:hover:bg-[#252525] cursor-pointer transition-colors"
                          >
                            <td className="px-3 py-2 text-[#616161] dark:text-[#b0b0b0] whitespace-nowrap">
                              {formatDateShort(a.activityDate)}
                            </td>
                            <td className="px-3 py-2 text-[#212121] dark:text-[#ffffff]">
                              {a.type}
                            </td>
                            <td className="px-3 py-2 text-[#616161] dark:text-[#b0b0b0] max-w-[120px] truncate" title={a.result ?? undefined}>
                              {a.result ?? "—"}
                            </td>
                            <td className="px-3 py-2 text-[#616161] dark:text-[#b0b0b0] max-w-[140px] truncate" title={a.comments ?? undefined}>
                              {a.comments ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <ActivityDetailModal
                activityId={selectedId}
                isOpen={!!selectedId}
                onClose={() => setSelectedId(null)}
              />

              <div className="border-t border-[#e0e0e0] dark:border-[#3a3a3a] pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-3 px-6">
                  Nueva actividad
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="activity-type"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="activity-type"
                    required
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="activity-date"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    Fecha y hora <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="activity-date"
                    type="datetime-local"
                    required
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="activity-result"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    Resultado de la interacción <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="activity-result"
                    type="text"
                    value={result}
                    required
                    onChange={(e) => setResult(e.target.value)}
                    placeholder="Ej. Cliente interesado, pendiente de cotización"
                    className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="activity-comments"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    Comentarios <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="activity-comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    required
                    placeholder="Notas adicionales..."
                    className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y min-h-[80px]"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="px-4 py-2.5 border-2 border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] font-semibold rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Guardando..." : "Registrar"}
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
