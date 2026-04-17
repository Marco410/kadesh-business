"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { ClientLeadAutocomplete } from "kadesh/components/shared";
import {
  CREATE_TECH_SALES_ACTIVITY_MUTATION,
  TECH_SALES_ACTIVITIES_QUERY,
  type CreateTechSalesActivityMutation,
  type CreateTechSalesActivityVariables,
  type TechSalesActivitiesVariables,
} from "kadesh/components/profile/sales/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import { workspaceConnectPayload } from "kadesh/components/profile/sales/workspaces/workspace-connect";
import { SALES_ACTIVITY_TYPE } from "kadesh/constants/constans";

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

const inputClassName =
  "w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#252525] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

export interface CreateWorkspaceActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  userId: string;
  defaultStatusCrmId?: string | null;
}

export default function CreateWorkspaceActivityModal({
  isOpen,
  onClose,
  workspaceId,
  userId,
  defaultStatusCrmId,
}: CreateWorkspaceActivityModalProps) {
  const [leadId, setLeadId] = useState("");
  const [type, setType] = useState<string>(SALES_ACTIVITY_TYPE.LLAMADA);
  const [activityDate, setActivityDate] = useState("");
  const [result, setResult] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLeadId("");
    setType(SALES_ACTIVITY_TYPE.LLAMADA);
    setActivityDate(formatDateTimeLocal(new Date()));
    setResult("");
    setComments("");
  }, [isOpen]);

  const boardWhere: TechSalesActivitiesVariables["where"] = mergeWorkspaceFilter(
    {},
    workspaceId
  );

  const [createActivity, { loading }] = useMutation<
    CreateTechSalesActivityMutation,
    CreateTechSalesActivityVariables
  >(CREATE_TECH_SALES_ACTIVITY_MUTATION, {
    refetchQueries: [{ query: TECH_SALES_ACTIVITIES_QUERY, variables: { where: boardWhere } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      sileo.success({ title: "Actividad registrada" });
      onClose();
    },
    onError: (err) => sileo.error({ title: err.message || "No se pudo registrar la actividad" }),
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

    createActivity({
      variables: {
        data: {
          type,
          activityDate: dateTimeLocalToISO(activityDate),
          result: result.trim() || null,
          comments: comments.trim() || null,
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
        key="cwa-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="cwa-dialog"
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
          aria-labelledby="create-ws-activity-title"
        >
          <div className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] px-5 py-4">
            <h2
              id="create-ws-activity-title"
              className="text-lg font-semibold text-[#212121] dark:text-white"
            >
              Registrar actividad
            </h2>
            <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e]">
              Se registrará dentro del workspace actual.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <ClientLeadAutocomplete
              id="ws-activity-lead"
              userId={userId}
              enabled={isOpen}
              selectedLeadId={leadId || null}
              onSelectedLeadIdChange={(id) => setLeadId(id ?? "")}
              placeholder="Buscar cliente por nombre"
              required
            />

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={inputClassName}
              >
                {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Fecha y hora
              </label>
              <input
                type="datetime-local"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Resultado
              </label>
              <input
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className={inputClassName}
                placeholder="Ej. Cliente interesado"
                required
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
                placeholder="Notas adicionales…"
                required
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
                {loading ? "Guardando…" : "Registrar"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

