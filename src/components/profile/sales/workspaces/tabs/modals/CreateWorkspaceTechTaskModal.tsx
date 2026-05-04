"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import {
  ClientLeadAutocomplete,
  Autocomplete,
  RequiredFieldMark,
  type AutocompleteOption,
} from "kadesh/components/shared";
import {
  CREATE_TECH_TASK_MUTATION,
  TECH_TASKS_QUERY,
  type CreateTechTaskMutation,
  type CreateTechTaskVariables,
  type TechTasksVariables,
} from "kadesh/components/profile/sales/queries";
import {
  SAAS_WORKSPACE_DETAIL_QUERY,
  type SaasWorkspaceDetailResponse,
  type SaasWorkspaceDetailVariables,
} from "kadesh/components/profile/sales/workspaces/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import { Role, TASK_PRIORITY } from "kadesh/constants/constans";
import { useUser } from "kadesh/utils/UserContext";

const TASK_PRIORITY_OPTIONS = Object.values(TASK_PRIORITY);

function memberDisplayName(m: {
  name: string;
  lastName: string | null;
  email: string | null;
}): string {
  const full = [m.name, m.lastName ?? ""].filter(Boolean).join(" ").trim();
  return m.email ? `${full}` : full;
}

function formatDateForInput(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateInputToIso(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  return new Date(`${dateStr}T12:00:00`).toISOString();
}

const inputClassName =
  "w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#252525] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

export interface CreateWorkspaceTechTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  userId: string;
  defaultStatusCrmId?: string | null;
}

export default function CreateWorkspaceTechTaskModal({
  isOpen,
  onClose,
  workspaceId,
  userId,
  defaultStatusCrmId,
}: CreateWorkspaceTechTaskModalProps) {
  const { user } = useUser();
  const isUserCompany =
    user?.roles?.some((r) => r.name === Role.USER_COMPANY) ?? false;

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<string>(TASK_PRIORITY.MEDIA);
  const [comments, setComments] = useState("");
  const [leadId, setLeadId] = useState("");
  const [responsibleUserId, setResponsibleUserId] = useState("");

  const { data: wsDetail, loading: wsMembersLoading } = useQuery<
    SaasWorkspaceDetailResponse,
    SaasWorkspaceDetailVariables
  >(SAAS_WORKSPACE_DETAIL_QUERY, {
    variables: { where: { id: workspaceId } },
    skip: !isOpen || !workspaceId || isUserCompany,
    fetchPolicy: "cache-and-network",
  });

  const memberOptions = useMemo<AutocompleteOption[]>(() => {
    const members = wsDetail?.saasWorkspace?.members ?? [];
    return members.map((m) => ({
      id: m.id,
      label: memberDisplayName(m),
    }));
  }, [wsDetail?.saasWorkspace?.members]);

  useEffect(() => {
    if (!isOpen) return;
    setTitle("");
    setStartDate(formatDateForInput(new Date().toISOString()));
    setDueDate("");
    setPriority(TASK_PRIORITY.MEDIA);
    setComments("");
    setLeadId("");
    setResponsibleUserId("");
  }, [isOpen]);

  const boardWhere: TechTasksVariables["where"] = mergeWorkspaceFilter({}, workspaceId);

  const [createTask, { loading }] = useMutation<
    CreateTechTaskMutation,
    CreateTechTaskVariables
  >(CREATE_TECH_TASK_MUTATION, {
    refetchQueries: [{ query: TECH_TASKS_QUERY, variables: { where: boardWhere } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      sileo.success({ title: "Tarea creada" });
      onClose();
    },
    onError: (err) =>
      sileo.error({ title: err.message || "No se pudo crear la tarea" }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const statusCrmConnect =
      defaultStatusCrmId != null && defaultStatusCrmId !== ""
        ? { statusCrm: { connect: { id: defaultStatusCrmId } } }
        : {};
    const leadConnect =
      leadId.trim() !== "" ? { businessLead: { connect: { id: leadId.trim() } } } : {};
    const responsibleConnect = isUserCompany
      ? { responsible: { connect: { id: userId } } }
      : responsibleUserId.trim() !== ""
        ? { responsible: { connect: { id: responsibleUserId.trim() } } }
        : {};

    createTask({
      variables: {
        data: {
          title: title.trim() || null,
          startDate: dateInputToIso(startDate),
          dueDate: dateInputToIso(dueDate),
          priority: priority || TASK_PRIORITY.MEDIA,
          comments: comments.trim() || null,
          workspace: { connect: { id: workspaceId } },
          createdBy: { connect: { id: userId } },
          ...responsibleConnect,
          ...leadConnect,
          ...statusCrmConnect,
        },
      },
    });
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cwt-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="cwt-dialog"
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
          aria-labelledby="create-ws-tech-task-title"
        >
          <div className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] px-5 py-4">
            <h2
              id="create-ws-tech-task-title"
              className="text-lg font-semibold text-[#212121] dark:text-white"
            >
              Nueva tarea
            </h2>
            <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e]">
              Tarea general del workspace (independiente de actividades de ventas).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Título <RequiredFieldMark />
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Revisar contrato, llamada con proveedor…"
                className={inputClassName}
                required
                minLength={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Prioridad <RequiredFieldMark />
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputClassName}
                required
              >
                {TASK_PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                  Fecha de la tarea <RequiredFieldMark />
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClassName}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                  Fecha límite <RequiredFieldMark />
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClassName}
                  required
                />
              </div>
            </div>

            <ClientLeadAutocomplete
              id="ws-tech-task-lead"
              label="Cliente"
              userId={userId}
              enabled={isOpen}
              selectedLeadId={leadId || null}
              onSelectedLeadIdChange={(id) => setLeadId(id ?? "")}
              placeholder="Buscar y seleccionar cliente"
              required
            />

            {isUserCompany ? (
              <div>
              </div>
            ) : (
              <Autocomplete
                id="ws-tech-task-responsible"
                label="Responsable"
                value={responsibleUserId}
                options={memberOptions}
                onSelect={(option) => setResponsibleUserId(option?.id ?? "")}
                placeholder="Buscar miembro del workspace"
                loading={wsMembersLoading}
                required
              />
            )}

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Comentarios <RequiredFieldMark />
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className={inputClassName}
                rows={3}
                placeholder="Detalle o contexto…"
                required
                minLength={1}
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
                {loading ? "Guardando…" : "Crear tarea"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
