"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import {
  CREATE_SAAS_WORKSPACE_MUTATION,
  SAAS_WORKSPACES_QUERY,
  type CreateSaasWorkspaceMutation,
  type CreateSaasWorkspaceVariables,
} from "kadesh/components/profile/sales/workspaces/queries";
import { useWorkspaceContext } from "kadesh/components/profile/sales/workspaces/WorkspaceContext";

export interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  userId,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [showTasks, setShowTasks] = useState(true);
  const [showActivities, setShowActivities] = useState(true);
  const [showProposals, setShowProposals] = useState(true);
  const [showFollowUpTasks, setShowFollowUpTasks] = useState(true);
  const { setCurrentWorkspaceId } = useWorkspaceContext();

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setShowTasks(true);
    setShowActivities(true);
    setShowProposals(true);
    setShowFollowUpTasks(true);
  }, [isOpen]);

  const [createWs, { loading }] = useMutation<
    CreateSaasWorkspaceMutation,
    CreateSaasWorkspaceVariables
  >(CREATE_SAAS_WORKSPACE_MUTATION, {
    refetchQueries: [{ query: SAAS_WORKSPACES_QUERY }],
    awaitRefetchQueries: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      sileo.warning({ title: "Escribe un nombre para el espacio" });
      return;
    }
    try {
      const { data } = await createWs({
        variables: {
          data: {
            name: trimmed,
            members: { connect: [{ id: userId }] },
            showTasks,
            showActivities,
            showProposals,
            showFollowUpTasks,
          },
        },
      });
      const id = data?.createSaasWorkspace?.id;
      if (id) setCurrentWorkspaceId(id);
      sileo.success({ title: "Espacio creado" });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo crear el espacio";
      sileo.error({ title: msg });
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cw-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="cw-dialog"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="modal fixed inset-0 z-[125] pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-md rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-workspace-title"
        >
          <div className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] px-5 py-4">
            <h2
              id="create-workspace-title"
              className="text-lg font-semibold text-[#212121] dark:text-white"
            >
              Nuevo espacio de trabajo
            </h2>
            <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e]">
              Agrupa tareas del espacio, actividades de ventas, seguimientos y propuestas en un mismo
              contexto.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label
                htmlFor="ws-name"
                className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
              >
                Nombre
              </label>
              <input
                id="ws-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Equipo norte, Cuenta ACME…"
                className="w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#252525] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                autoFocus
              />
            </div>
            <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#181818] p-4 space-y-3">
              <p className="text-sm font-semibold text-[#212121] dark:text-white">
                Mostrar en este workspace
              </p>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showTasks}
                  onChange={(e) => setShowTasks(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#e0e0e0] dark:border-[#3a3a3a] accent-orange-500"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[#212121] dark:text-white">
                    Tareas
                  </span>
                  <span className="block text-xs text-[#616161] dark:text-[#9e9e9e]">
                    Mostrar tareas generales del workspace (no son actividades de ventas ni
                    seguimientos de lead)
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showActivities}
                  onChange={(e) => setShowActivities(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#e0e0e0] dark:border-[#3a3a3a] accent-orange-500"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[#212121] dark:text-white">
                    Actividades
                  </span>
                  <span className="block text-xs text-[#616161] dark:text-[#9e9e9e]">
                    Mostrar actividades de ventas en este espacio de trabajo
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showFollowUpTasks}
                  onChange={(e) => setShowFollowUpTasks(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#e0e0e0] dark:border-[#3a3a3a] accent-orange-500"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[#212121] dark:text-white">
                    Seguimientos
                  </span>
                  <span className="block text-xs text-[#616161] dark:text-[#9e9e9e]">
                    Mostrar tareas de seguimiento de CRM en este workspace
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showProposals}
                  onChange={(e) => setShowProposals(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#e0e0e0] dark:border-[#3a3a3a] accent-orange-500"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[#212121] dark:text-white">
                    Propuestas
                  </span>
                  <span className="block text-xs text-[#616161] dark:text-[#9e9e9e]">
                    Mostrar propuestas de CRM en este workspace
                  </span>
                </span>
              </label>
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
                {loading ? "Guardando…" : "Crear espacio"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
