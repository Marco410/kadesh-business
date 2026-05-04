"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import {
  SAAS_WORKSPACE_DETAIL_QUERY,
  COMPANY_USERS_FOR_WORKSPACE_QUERY,
  UPDATE_SAAS_WORKSPACE_MUTATION,
  SAAS_WORKSPACES_QUERY,
  type SaasWorkspaceDetailResponse,
  type SaasWorkspaceDetailVariables,
  type CompanyUsersForWorkspaceResponse,
  type CompanyUsersForWorkspaceVariables,
  type UpdateSaasWorkspaceMutation,
  type UpdateSaasWorkspaceVariables,
} from "kadesh/components/profile/sales/workspaces/queries";
import AddCompanyUserForm from "kadesh/components/profile/sales/workspaces/members/AddCompanyUserForm";
import { Routes } from "kadesh/core/routes";

export interface WorkspaceMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string | null;
  companyId: string | null;
}

export default function WorkspaceMembersModal({
  isOpen,
  onClose,
  workspaceId,
  companyId,
}: WorkspaceMembersModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formEditingId, setFormEditingId] = useState<string | null>(null);
  const formAnchorRef = useRef<HTMLDivElement>(null);

  const { data: wsData, loading: wsLoading } = useQuery<
    SaasWorkspaceDetailResponse,
    SaasWorkspaceDetailVariables
  >(SAAS_WORKSPACE_DETAIL_QUERY, {
    variables: { where: { id: workspaceId ?? "" } },
    skip: !isOpen || !workspaceId,
    fetchPolicy: "network-only",
  });

  const { data: usersData, loading: usersLoading } = useQuery<
    CompanyUsersForWorkspaceResponse,
    CompanyUsersForWorkspaceVariables
  >(COMPANY_USERS_FOR_WORKSPACE_QUERY, {
    variables: {
      where: { company: { id: { equals: companyId ?? "" } } },
    },
    skip: !isOpen || !companyId,
    fetchPolicy: "cache-and-network",
  });

  const companyUsers = usersData?.users ?? [];

  useEffect(() => {
    if (!isOpen || !workspaceId || wsLoading) return;
    const ws = wsData?.saasWorkspace;
    if (!ws) return;
    setSelected(new Set(ws.members.map((m) => m.id)));
  }, [isOpen, workspaceId, wsLoading, wsData?.saasWorkspace]);

  useEffect(() => {
    if (!isOpen) setFormEditingId(null);
  }, [isOpen]);

  const listRefetchQueries = useMemo(() => {
    if (!companyId || !workspaceId) return [];
    return [
      {
        query: COMPANY_USERS_FOR_WORKSPACE_QUERY,
        variables: { where: { company: { id: { equals: companyId } } } },
      },
      {
        query: SAAS_WORKSPACE_DETAIL_QUERY,
        variables: { where: { id: workspaceId } },
      },
    ];
  }, [companyId, workspaceId]);

  const [updateWs, { loading: saving }] = useMutation<
    UpdateSaasWorkspaceMutation,
    UpdateSaasWorkspaceVariables
  >(UPDATE_SAAS_WORKSPACE_MUTATION, {
    refetchQueries: [
      { query: SAAS_WORKSPACES_QUERY },
      ...(workspaceId
        ? [
            {
              query: SAAS_WORKSPACE_DETAIL_QUERY,
              variables: { where: { id: workspaceId } },
            },
          ]
        : []),
    ],
    awaitRefetchQueries: true,
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    if (!workspaceId) return;
    if (selected.size === 0) {
      sileo.warning({ title: "Debe haber al menos un miembro" });
      return;
    }
    try {
      await updateWs({
        variables: {
          where: { id: workspaceId },
          data: {
            members: { set: [...selected].map((id) => ({ id })) },
          },
        },
      });
      sileo.success({ title: "Miembros actualizados" });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo guardar";
      sileo.error({ title: msg });
    }
  }

  const sortedUsers = useMemo(
    () =>
      [...companyUsers].sort((a, b) =>
        `${a.name} ${a.lastName ?? ""}`.localeCompare(
          `${b.name} ${b.lastName ?? ""}`,
          "es",
          { sensitivity: "base" }
        )
      ),
    [companyUsers]
  );

  const selectedMembers = useMemo(() => {
    const map = new Map(sortedUsers.map((u) => [u.id, u]));
    return [...selected]
      .map((id) => map.get(id))
      .filter(Boolean) as CompanyUsersForWorkspaceResponse["users"];
  }, [selected, sortedUsers]);

  const notInWorkspace = useMemo(
    () => sortedUsers.filter((u) => !selected.has(u.id)),
    [sortedUsers, selected]
  );

  if (!isOpen || !workspaceId) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="wm-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="wm-dialog"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="modal fixed inset-0 z-[125] pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-6xl rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ws-members-title"
        >
          <div className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] px-5 py-4 shrink-0 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                id="ws-members-title"
                className="text-lg font-semibold text-[#212121] dark:text-white"
              >
                Miembros del espacio
              </h2>
              <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e]">
                {wsData?.saasWorkspace?.name ?? "Espacio"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormEditingId(null);
                  formAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                <HugeiconsIcon icon={UserAdd01Icon} size={18} />
                Nuevo usuario (empresa)
              </button>
              <Link
                href={Routes.panelAddCompanyUser}
                className="inline-flex items-center rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] px-3 py-2 text-sm font-medium text-[#212121] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
              >
                Abrir página completa
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              <div ref={formAnchorRef} className="min-w-0">
                <AddCompanyUserForm
                  companyId={companyId}
                  editingId={formEditingId}
                  onEditingIdChange={setFormEditingId}
                  compact
                  listRefetchQueries={listRefetchQueries}
                  onUserCreated={(id) => {
                    setSelected((prev) => new Set(prev).add(id));
                  }}
                />
              </div>

              <div className="min-w-0 flex flex-col gap-4">
                <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#181818] overflow-hidden">
                  <h3 className="px-4 py-2.5 text-sm font-bold text-[#212121] dark:text-white border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a]">
                    En este espacio ({selected.size})
                  </h3>
                  <div className="p-3 space-y-2 max-h-[min(40vh,320px)] overflow-y-auto">
                    {wsLoading || usersLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-14 rounded-xl bg-[#e8e8e8] dark:bg-[#333] animate-pulse"
                          />
                        ))}
                      </div>
                    ) : selectedMembers.length === 0 ? (
                      <p className="text-sm text-[#616161] dark:text-[#9e9e9e] py-4 text-center">
                        Sin miembros seleccionados. Agrega usuarios desde la lista de la empresa o
                        crea uno nuevo.
                      </p>
                    ) : (
                      selectedMembers.map((u) => (
                        <div
                          key={u.id}
                          className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e8e8e8] dark:border-[#333] bg-white dark:bg-[#1e1e1e] px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[#212121] dark:text-white truncate">
                              {[u.name, u.lastName].filter(Boolean).join(" ")}
                            </p>
                            <p className="text-xs text-[#616161] dark:text-[#9e9e9e] truncate">
                              {u.email ?? "—"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setFormEditingId(u.id)}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => toggle(u.id)}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-[#616161] hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a]"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] overflow-hidden">
                  <h3 className="px-4 py-2.5 text-sm font-bold text-[#212121] dark:text-white border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a]">
                    Agregar miembro de la empresa
                  </h3>
                  <div className="p-3 space-y-3">
                    <p className="text-xs text-[#616161] dark:text-[#9e9e9e]">
                      Incluye a alguien que ya existe en tu empresa en este espacio.
                    </p>
                    <select
                      className="w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#252525] px-3 py-2.5 text-sm text-[#212121] dark:text-white"
                      defaultValue=""
                      onChange={(e) => {
                        const id = e.target.value;
                        if (!id) return;
                        setSelected((prev) => new Set(prev).add(id));
                        e.target.value = "";
                      }}
                    >
                      <option value="">Seleccionar usuario…</option>
                      {notInWorkspace.map((u) => (
                        <option key={u.id} value={u.id}>
                          {[u.name, u.lastName].filter(Boolean).join(" ")} — {u.email ?? u.id}
                        </option>
                      ))}
                    </select>
                    {notInWorkspace.length === 0 && !usersLoading && (
                      <p className="text-xs text-[#616161] dark:text-[#9e9e9e]">
                        Todos los usuarios de la empresa ya están en el espacio, o no hay más
                        usuarios.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] overflow-hidden">
                  <h3 className="px-4 py-2.5 text-sm font-bold text-[#212121] dark:text-white border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a]">
                    Todos los usuarios (empresa)
                  </h3>
                  <div className="p-2 max-h-[min(28vh,240px)] overflow-y-auto space-y-1">
                    {sortedUsers.map((u) => (
                      <label
                        key={u.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 hover:bg-[#f8f8f8] dark:hover:bg-[#252525]"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(u.id)}
                          onChange={() => toggle(u.id)}
                          className="rounded border-[#c4c4c4] text-orange-500 focus:ring-orange-500"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#212121] dark:text-white truncate">
                            {[u.name, u.lastName].filter(Boolean).join(" ")}
                          </p>
                          {u.email && (
                            <p className="text-xs text-[#616161] dark:text-[#9e9e9e] truncate">
                              {u.email}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#e0e0e0] dark:border-[#3a3a3a] px-5 py-4 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-[#616161] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || wsLoading}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar miembros"}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
