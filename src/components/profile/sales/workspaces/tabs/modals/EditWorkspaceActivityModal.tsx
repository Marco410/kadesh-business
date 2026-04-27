"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import Link from "next/link";
import { Autocomplete, type AutocompleteOption } from "kadesh/components/shared";
import {
  TECH_SALES_ACTIVITIES_QUERY,
  UPDATE_TECH_SALES_ACTIVITY_MUTATION,
  type TechSalesActivitiesResponse,
  type TechSalesActivitiesVariables,
  type UpdateTechSalesActivityMutation,
  type UpdateTechSalesActivityVariables,
} from "kadesh/components/profile/sales/queries";
import {
  SAAS_WORKSPACE_DETAIL_QUERY,
  type SaasWorkspaceCrmStatus,
  type SaasWorkspaceDetailResponse,
  type SaasWorkspaceDetailVariables,
} from "kadesh/components/profile/sales/workspaces/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import HiddenInWorkspaceSwitch from "./HiddenInWorkspaceSwitch";
import { Routes } from "kadesh/core/routes";
import { SALES_ACTIVITY_TYPE, TASK_PRIORITY } from "kadesh/constants/constans";

const ACTIVITY_TYPE_OPTIONS = Object.values(SALES_ACTIVITY_TYPE);
const TASK_PRIORITY_OPTIONS = Object.values(TASK_PRIORITY);

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

/** Valor para `input type="date"` a partir de un calendar day / ISO del API. */
function dueDateToDateInput(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function memberDisplayName(m: {
  name: string;
  lastName: string | null;
  email: string | null;
}): string {
  const full = [m.name, m.lastName ?? ""].filter(Boolean).join(" ").trim();
  return m.email ? `${full} (${m.email})` : full;
}

const inputClassName =
  "w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#252525] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

type ActivityRow = TechSalesActivitiesResponse["techSalesActivities"][number];

export interface EditWorkspaceActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  activity: ActivityRow | null;
  crmStatuses: SaasWorkspaceCrmStatus[];
  defaultCrmStatusId: string | null;
}

export default function EditWorkspaceActivityModal({
  isOpen,
  onClose,
  workspaceId,
  activity,
  crmStatuses,
  defaultCrmStatusId,
}: EditWorkspaceActivityModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<string>(TASK_PRIORITY.MEDIA);
  const [responsibleUserId, setResponsibleUserId] = useState("");
  const [result, setResult] = useState("");
  const [comments, setComments] = useState("");
  const [statusCrmId, setStatusCrmId] = useState("");
  const [hiddenInWorkspace, setHiddenInWorkspace] = useState(false);

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
    const seller = activity?.assignedSeller;
    if (seller && !opts.some((o) => o.id === seller.id)) {
      const label = [seller.name, seller.lastName ?? ""].filter(Boolean).join(" ").trim();
      opts.unshift({ id: seller.id, label: label || seller.id });
    }
    return opts;
  }, [wsDetail?.saasWorkspace?.members, activity?.assignedSeller]);

  useEffect(() => {
    if (!isOpen || !activity) return;
    setTitle(activity.title?.trim() ?? activity.type);
    setType(activity.type);
    setActivityDate(formatDateTimeLocal(new Date(activity.activityDate)));
    setDueDate(dueDateToDateInput(activity.dueDate));
    setPriority(activity.priority ?? TASK_PRIORITY.MEDIA);
    setResponsibleUserId(activity.assignedSeller?.id ?? "");
    setResult(activity.result ?? "");
    setComments(activity.comments ?? "");
    setStatusCrmId(
      activity.statusCrm?.id ?? defaultCrmStatusId ?? crmStatuses[0]?.id ?? ""
    );
    setHiddenInWorkspace(activity.hiddenInWorkspace === true);
  }, [isOpen, activity, defaultCrmStatusId, crmStatuses]);

  const boardWhere: TechSalesActivitiesVariables["where"] = mergeWorkspaceFilter(
    {},
    workspaceId
  );

  const [updateActivity, { loading }] = useMutation<
    UpdateTechSalesActivityMutation,
    UpdateTechSalesActivityVariables
  >(UPDATE_TECH_SALES_ACTIVITY_MUTATION, {
    refetchQueries: [{ query: TECH_SALES_ACTIVITIES_QUERY, variables: { where: boardWhere } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      sileo.success({ title: "Actividad actualizada" });
      onClose();
    },
    onError: (err) =>
      sileo.error({ title: err.message || "No se pudo actualizar la actividad" }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activity) return;
    if (!title.trim()) {
      sileo.warning({ title: "Escribe el título de la actividad" });
      return;
    }
    if (!responsibleUserId.trim()) {
      sileo.warning({ title: "Selecciona un responsable" });
      return;
    }
    const statusPayload =
      statusCrmId.trim() !== ""
        ? { statusCrm: { connect: { id: statusCrmId.trim() } } }
        : {};
    const due = dueDate.trim();
    updateActivity({
      variables: {
        where: { id: activity.id },
        data: {
          title: title.trim(),
          dueDate: due ? due : null,
          priority: priority || TASK_PRIORITY.MEDIA,
          type,
          activityDate: dateTimeLocalToISO(activityDate),
          result: result.trim() || null,
          comments: comments.trim() || null,
          hiddenInWorkspace,
          assignedSeller: { connect: { id: responsibleUserId.trim() } },
          ...statusPayload,
        },
      },
    });
  }

  if (!isOpen || !activity) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="ewa-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="ewa-dialog"
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
          aria-labelledby="edit-ws-activity-title"
        >
          <div className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] px-5 py-4">
            <h2
              id="edit-ws-activity-title"
              className="text-lg font-semibold text-[#212121] dark:text-white"
            >
              Editar actividad
            </h2>
            {activity.businessLead && (
              <Link
                href={Routes.panelLead(activity.businessLead.id)}
                className="mt-2 inline-block text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
              >
                Ir al lead: {activity.businessLead.businessName}
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
              <label
                htmlFor="edit-ws-activity-title"
                className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
              >
                Título de la actividad
              </label>
              <input
                id="edit-ws-activity-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClassName}
                required
              />
            </div>

            <Autocomplete
              id="edit-ws-activity-responsible"
              label="Responsable"
              value={responsibleUserId}
              options={memberOptions}
              onSelect={(option) => setResponsibleUserId(option?.id ?? "")}
              placeholder="Buscar miembro del workspace"
              required
              loading={wsMembersLoading}
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
              <label
                htmlFor="edit-ws-activity-due"
                className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
              >
                Fecha límite
              </label>
              <p className="mb-1.5 text-xs text-[#616161] dark:text-[#9e9e9e]">
                Opcional. Deadline para esta actividad.
              </p>
              <input
                id="edit-ws-activity-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClassName}
              />
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

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Resultado
              </label>
              <input
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className={inputClassName}
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
                required
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
