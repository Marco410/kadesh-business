"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAdd01Icon,
  Cancel01Icon,
  Search01Icon,
  Edit02Icon,
  Delete02Icon,
  Add01Icon,
  Tick02Icon,
  LinkSquare02Icon,
} from "@hugeicons/core-free-icons";
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
import { useApplyOnKeyChange } from "kadesh/utils/useApplyOnKeyChange";
import { friendlyErrorText } from "kadesh/utils/errorText";

export interface WorkspaceMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string | null;
  companyId: string | null;
}

type MembersTab = "miembros" | "crear";

function initials(name: string, lastName: string | null | undefined): string {
  const a = name.trim().charAt(0);
  const b = (lastName ?? "").trim().charAt(0);
  return (a + b).toUpperCase() || "?";
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export default function WorkspaceMembersModal({
  isOpen,
  onClose,
  workspaceId,
  companyId,
}: WorkspaceMembersModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formEditingId, setFormEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MembersTab>("miembros");
  const [search, setSearch] = useState("");

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

  useApplyOnKeyChange(
    [
      isOpen,
      workspaceId,
      wsLoading,
      (wsData?.saasWorkspace?.members ?? [])
        .map((member) => member.id)
        .join(","),
    ].join("\0"),
    () => {
      if (!isOpen || !workspaceId || wsLoading) return;
      const ws = wsData?.saasWorkspace;
      if (!ws) return;
      setSelected(new Set(ws.members.map((m) => m.id)));
    },
  );

  useApplyOnKeyChange(isOpen, () => {
    if (!isOpen) {
      setFormEditingId(null);
      setActiveTab("miembros");
      setSearch("");
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

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

  function startEdit(id: string) {
    setFormEditingId(id);
    setActiveTab("crear");
  }

  function startCreate() {
    setFormEditingId(null);
    setActiveTab("crear");
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
      const msg = friendlyErrorText(err, "No se pudo guardar");
      sileo.error({ title: msg });
    }
  }

  const sortedUsers = useMemo(
    () =>
      [...companyUsers].sort((a, b) =>
        `${a.name} ${a.lastName ?? ""}`.localeCompare(
          `${b.name} ${b.lastName ?? ""}`,
          "es",
          { sensitivity: "base" },
        ),
      ),
    [companyUsers],
  );

  const selectedMembers = useMemo(() => {
    const map = new Map(sortedUsers.map((u) => [u.id, u]));
    return [...selected]
      .map((id) => map.get(id))
      .filter(Boolean) as CompanyUsersForWorkspaceResponse["users"];
  }, [selected, sortedUsers]);

  const filteredDirectory = useMemo(() => {
    const q = normalizeSearch(search.trim());
    if (!q) return sortedUsers;
    return sortedUsers.filter((u) => {
      const hay = normalizeSearch(
        [u.name, u.lastName, u.email].filter(Boolean).join(" "),
      );
      return hay.includes(q);
    });
  }, [search, sortedUsers]);

  const notInWorkspaceCount = sortedUsers.filter(
    (u) => !selected.has(u.id),
  ).length;

  const tabs: Array<{ id: MembersTab; label: string; count?: number }> = [
    { id: "miembros", label: "Miembros", count: selected.size },
    {
      id: "crear",
      label: formEditingId ? "Editar usuario" : "Crear usuario",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && workspaceId && (
        <>
          <motion.div
            data-body-scroll-lock
            key="wm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/50"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="wm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ws-members-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
            className="fixed inset-0 z-[125] flex items-end justify-center p-0 sm:items-center sm:p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto flex h-[min(100dvh,100%)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-dash-line bg-dash-surface shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="shrink-0 border-b border-dash-line">
                <div className="flex items-start gap-3 px-4 pt-4 pb-3 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <h2
                      id="ws-members-title"
                      className="text-lg font-bold text-dash-ink"
                    >
                      Miembros del espacio
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-dash-muted">
                      {wsData?.saasWorkspace?.name ?? "Espacio"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-ink"
                    aria-label="Cerrar"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={22} />
                  </button>
                </div>

                <div
                  role="tablist"
                  aria-label="Secciones de miembros"
                  className="flex gap-1 overflow-x-auto px-3 pb-2 sm:px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {tabs.map((tab) => {
                    const selectedTab = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={selectedTab}
                        onClick={() => {
                          if (tab.id === "crear" && !formEditingId) {
                            startCreate();
                          } else {
                            setActiveTab(tab.id);
                          }
                        }}
                        className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.97] ${
                          selectedTab
                            ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                            : "text-dash-muted hover:bg-dash-hover"
                        }`}
                      >
                        {tab.label}
                        {tab.count != null && (
                          <span
                            className={`tabular-nums text-xs ${
                              selectedTab
                                ? "text-white/90"
                                : "text-dash-faint dark:text-[#777]"
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Body */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
                {activeTab === "miembros" && (
                  <div className="space-y-5">
                    <section className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-dash-faint dark:text-[#888]">
                          En este espacio
                        </h3>
                        <button
                          type="button"
                          onClick={startCreate}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-orange-600 dark:text-orange-400"
                        >
                          <HugeiconsIcon icon={UserAdd01Icon} size={14} />
                          Crear usuario
                        </button>
                      </div>

                      {wsLoading || usersLoading ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-16 dash-shimmer rounded-xl"
                            />
                          ))}
                        </div>
                      ) : selectedMembers.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-dash-line px-4 py-8 text-center">
                          <p className="text-sm font-medium text-dash-ink">
                            Nadie en el espacio aún
                          </p>
                          <p className="mt-1 text-xs text-dash-muted">
                            Agrega personas de la empresa abajo o crea un usuario
                            nuevo.
                          </p>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {selectedMembers.map((u) => {
                            const fullName =
                              [u.name, u.lastName].filter(Boolean).join(" ") ||
                              "—";
                            return (
                              <li
                                key={u.id}
                                className="flex flex-col gap-2 rounded-xl border border-dash-line p-3 sm:flex-row sm:items-center"
                              >
                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
                                    {initials(u.name, u.lastName)}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-dash-ink">
                                      {fullName}
                                    </p>
                                    <p className="truncate text-xs text-dash-muted">
                                      {u.email ?? "Sin correo"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEdit(u.id)}
                                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-dash-line px-3 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-500/10 dark:text-orange-400 sm:flex-initial"
                                  >
                                    <HugeiconsIcon icon={Edit02Icon} size={16} />
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggle(u.id)}
                                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-dash-line px-3 text-sm font-medium text-dash-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400 sm:flex-initial"
                                  >
                                    <HugeiconsIcon icon={Delete02Icon} size={16} />
                                    Quitar
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </section>

                    <section className="space-y-2">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-dash-faint dark:text-[#888]">
                          Personas de la empresa
                        </h3>
                        <p className="mt-0.5 text-xs text-dash-muted">
                          {notInWorkspaceCount === 0
                            ? "Todos los usuarios ya están en el espacio."
                            : `Marca quién entra a este espacio (${notInWorkspaceCount} disponibles).`}
                        </p>
                      </div>

                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dash-faint">
                          <HugeiconsIcon icon={Search01Icon} size={16} />
                        </span>
                        <input
                          type="search"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Buscar por nombre o correo…"
                          aria-label="Buscar usuarios de la empresa"
                          className="w-full min-h-11 rounded-xl border border-dash-line bg-white py-2.5 pl-9 pr-3 text-sm text-dash-ink placeholder:text-[#9ca3af] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-[#2a2a2a]"
                        />
                      </div>

                      {usersLoading ? (
                        <div className="space-y-2">
                          {[1, 2].map((i) => (
                            <div
                              key={i}
                              className="h-14 dash-shimmer rounded-xl"
                            />
                          ))}
                        </div>
                      ) : filteredDirectory.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-dash-line px-4 py-6 text-center text-sm text-dash-muted">
                          {sortedUsers.length === 0
                            ? "No hay usuarios en la empresa. Crea uno en la otra pestaña."
                            : `Nadie coincide con “${search.trim()}”.`}
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {filteredDirectory.map((u) => {
                            const inSpace = selected.has(u.id);
                            const fullName =
                              [u.name, u.lastName].filter(Boolean).join(" ") ||
                              "—";
                            return (
                              <li
                                key={u.id}
                                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                                  inSpace
                                    ? "border-orange-500/40 bg-orange-500/[0.06] dark:bg-orange-500/10"
                                    : "border-dash-line"
                                }`}
                              >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dash-surface-2 text-[11px] font-semibold text-dash-muted">
                                  {initials(u.name, u.lastName)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-dash-ink">
                                    {fullName}
                                  </p>
                                  {u.email && (
                                    <p className="truncate text-xs text-dash-muted">
                                      {u.email}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggle(u.id)}
                                  className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors ${
                                    inSpace
                                      ? "dash-grad-accent text-white hover:shadow-dash-accent-lift shadow-dash-accent"
                                      : "border border-dash-line text-dash-ink hover:border-orange-500/40 hover:bg-orange-500/[0.04]"
                                  }`}
                                >
                                  {inSpace ? (
                                    <>
                                      <HugeiconsIcon icon={Tick02Icon} size={16} />
                                      En el espacio
                                    </>
                                  ) : (
                                    <>
                                      <HugeiconsIcon icon={Add01Icon} size={16} />
                                      Agregar
                                    </>
                                  )}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </section>

                    <Link
                      href={Routes.panelAddCompanyUser}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dash-line text-sm font-medium text-dash-muted transition-colors hover:bg-dash-hover"
                    >
                      <HugeiconsIcon icon={LinkSquare02Icon} size={16} />
                      Abrir página completa de usuarios
                    </Link>
                  </div>
                )}

                {activeTab === "crear" && (
                  <div className="space-y-3">
                    <p className="text-sm text-dash-muted">
                      {formEditingId
                        ? "Actualiza los datos del usuario. Si lo creaste para este espacio, ya queda marcado abajo al guardar miembros."
                        : "Crea un usuario de empresa. Al crearlo se agrega automáticamente a este espacio (confirma con Guardar miembros)."}
                    </p>
                    <AddCompanyUserForm
                      companyId={companyId}
                      editingId={formEditingId}
                      onEditingIdChange={(id) => {
                        setFormEditingId(id);
                        if (!id) setActiveTab("miembros");
                      }}
                      compact
                      listRefetchQueries={listRefetchQueries}
                      onUserCreated={(id) => {
                        setSelected((prev) => new Set(prev).add(id));
                        setActiveTab("miembros");
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-dash-line px-4 py-3 sm:px-5">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-xs text-dash-faint sm:text-left">
                    {selected.size}{" "}
                    {selected.size === 1 ? "miembro" : "miembros"} seleccionados
                  </p>
                  <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-medium text-dash-muted transition-colors hover:bg-dash-hover"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={saving || wsLoading}
                      className="inline-flex min-h-11 items-center justify-center rounded-full dash-grad-accent px-5 text-sm font-semibold text-white shadow-sm shadow-orange-500/25 transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:shadow-dash-accent-lift active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 shadow-dash-accent"
                    >
                      {saving ? "Guardando…" : "Guardar miembros"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
