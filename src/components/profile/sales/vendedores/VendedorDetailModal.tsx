"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  USER_VENDEDOR_DETAIL_QUERY,
  type UserVendedorDetailVariables,
  type UserVendedorDetailResponse,
} from "./queries";
import {
  UPDATE_TECH_PROPOSAL_MUTATION,
  type UpdateTechProposalVariables,
  type UpdateTechProposalMutation,
  DELETE_TECH_STATUS_BUSINESS_LEAD_MUTATION,
  type DeleteTechStatusBusinessLeadVariables,
  type DeleteTechStatusBusinessLeadMutation,
  UPDATE_TECH_BUSINESS_LEAD_MUTATION,
  type UpdateTechBusinessLeadVariables,
  type UpdateTechBusinessLeadMutation,
} from "kadesh/components/profile/sales/queries";
import {
  PIPELINE_STATUS_COLORS,
  PLAN_FEATURE_KEYS,
  PROPOSAL_STATUS,
  Role,
} from "kadesh/constants/constans";
import { formatDateShort } from "kadesh/utils/format-date";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Mail01Icon,
  CallIcon,
  Cancel01Icon,
  Chart01Icon,
  Calendar03Icon,
  FileAttachmentIcon,
  Task01Icon,
  UserRemove01Icon,
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  PercentCircleIcon,
} from "@hugeicons/core-free-icons";
import { hasPlanFeature } from "../helpers/plan-features";
import { useSubscription } from "../SubscriptionContext";
import { useUser } from "kadesh/utils/UserContext";
import { can } from "kadesh/components/profile/usuarios/can";
import { PERMISSION_KEYS } from "kadesh/components/profile/usuarios/permissions";
import { Routes } from "kadesh/core/routes";

interface VendedorDetailModalProps {
  vendedorId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

type DetailTab = "resumen" | "clientes" | "actividad" | "propuestas" | "seguimientos";

function formatName(
  name: string,
  lastName: string | null,
  secondLastName: string | null,
): string {
  return [name, lastName, secondLastName].filter(Boolean).join(" ");
}

function initials(name: string, lastName: string | null): string {
  const a = name.trim().charAt(0);
  const b = (lastName ?? "").trim().charAt(0);
  return (a + b).toUpperCase() || "?";
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#e0e0e0] dark:border-[#3a3a3a] px-4 py-8 text-center">
      <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">{message}</p>
    </div>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[#f5f5f5] dark:bg-[#2a2a2a] px-2 py-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
      {children}
    </span>
  );
}

export default function VendedorDetailModal({
  vendedorId,
  isOpen,
  onClose,
}: VendedorDetailModalProps) {
  const { user: currentUser } = useUser();
  const { subscription } = useSubscription();
  const [activeTab, setActiveTab] = useState<DetailTab>("resumen");

  const { data, loading } = useQuery<
    UserVendedorDetailResponse,
    UserVendedorDetailVariables
  >(USER_VENDEDOR_DETAIL_QUERY, {
    variables: { where: { id: vendedorId ?? "" } },
    skip: !isOpen || !vendedorId,
  });

  const [updateProposal] = useMutation<
    UpdateTechProposalMutation,
    UpdateTechProposalVariables
  >(UPDATE_TECH_PROPOSAL_MUTATION, {
    refetchQueries: [
      {
        query: USER_VENDEDOR_DETAIL_QUERY,
        variables: { where: { id: vendedorId ?? "" } },
      },
    ],
  });

  const refetchVendedorDetail = {
    query: USER_VENDEDOR_DETAIL_QUERY,
    variables: { where: { id: vendedorId ?? "" } },
  } as const;

  const [updateTechBusinessLead] = useMutation<
    UpdateTechBusinessLeadMutation,
    UpdateTechBusinessLeadVariables
  >(UPDATE_TECH_BUSINESS_LEAD_MUTATION);

  const [deleteTechStatusBusinessLead] = useMutation<
    DeleteTechStatusBusinessLeadMutation,
    DeleteTechStatusBusinessLeadVariables
  >(DELETE_TECH_STATUS_BUSINESS_LEAD_MUTATION, {
    awaitRefetchQueries: true,
    refetchQueries: [refetchVendedorDetail],
  });

  const isAdminCompany =
    currentUser?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;
  const canAssignLeads =
    can(currentUser, PERMISSION_KEYS.VENDEDORES_EDITAR, () => isAdminCompany) &&
    can(currentUser, PERMISSION_KEYS.CLIENTES_ASIGNAR, () => isAdminCompany);
  const canUnassign =
    hasPlanFeature(
      subscription?.planFeatures,
      PLAN_FEATURE_KEYS.ASSIGN_SALES_PERSON,
    ) && canAssignLeads;

  const [updatingProposalId, setUpdatingProposalId] = useState<string | null>(
    null,
  );
  const [unassigningLeadId, setUnassigningLeadId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (isOpen) setActiveTab("resumen");
  }, [isOpen, vendedorId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleUnassignLead = async (
    techStatusId: string,
    salesPersons: Array<{ id: string }> | { id: string } | null,
    techBusinessLeadId: string | undefined,
  ) => {
    const spArray = Array.isArray(salesPersons)
      ? salesPersons
      : salesPersons
        ? [salesPersons]
        : [];
    if (!vendedorId || !spArray.some((sp) => sp.id === vendedorId)) return;
    setUnassigningLeadId(techStatusId);
    try {
      if (techBusinessLeadId) {
        await updateTechBusinessLead({
          variables: {
            where: { id: techBusinessLeadId },
            data: { salesPerson: { disconnect: [{ id: vendedorId }] } },
          },
        });
      }
      await deleteTechStatusBusinessLead({
        variables: { where: { id: techStatusId } },
      });
    } finally {
      setUnassigningLeadId(null);
    }
  };

  const handleApprovedChange = async (proposalId: string, approved: boolean) => {
    setUpdatingProposalId(proposalId);
    try {
      await updateProposal({
        variables: {
          where: { id: proposalId },
          data: { approved },
        },
      });
    } finally {
      setUpdatingProposalId(null);
    }
  };

  const handlePaidChange = async (proposalId: string, paid: boolean) => {
    setUpdatingProposalId(proposalId);
    try {
      await updateProposal({
        variables: {
          where: { id: proposalId },
          data: { paid },
        },
      });
    } finally {
      setUpdatingProposalId(null);
    }
  };

  const user = data?.user ?? null;

  const counts = useMemo(
    () => ({
      clientes: user?.techStatusBusinessLeads.length ?? 0,
      actividad: user?.salesActivities.length ?? 0,
      propuestas: user?.proposals.length ?? 0,
      seguimientos: user?.followUpTasks.length ?? 0,
    }),
    [user],
  );

  const tabs: Array<{ id: DetailTab; label: string; count?: number }> = [
    { id: "resumen", label: "Resumen" },
    { id: "clientes", label: "Clientes", count: counts.clientes },
    { id: "actividad", label: "Actividad", count: counts.actividad },
    { id: "propuestas", label: "Propuestas", count: counts.propuestas },
    { id: "seguimientos", label: "Seguimientos", count: counts.seguimientos },
  ];

  const recentActivities = useMemo(() => {
    if (!user) return [];
    return [...user.salesActivities]
      .sort(
        (a, b) =>
          new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime(),
      )
      .slice(0, 3);
  }, [user]);

  const upcomingFollowUps = useMemo(() => {
    if (!user) return [];
    return [...user.followUpTasks]
      .sort(
        (a, b) =>
          new Date(a.scheduledDate).getTime() -
          new Date(b.scheduledDate).getTime(),
      )
      .slice(0, 3);
  }, [user]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            data-body-scroll-lock
            key="vendedor-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="vendedor-detail-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vendedor-detail-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
            className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto flex h-[min(100dvh,100%)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-[#e0e0e0] bg-white shadow-2xl dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="shrink-0 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
                <div className="flex items-start gap-3 px-4 pt-4 pb-3 sm:px-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-base font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-300 sm:h-14 sm:w-14 sm:text-lg">
                    {loading || !user ? (
                      <HugeiconsIcon icon={UserIcon} size={22} />
                    ) : (
                      initials(user.name, user.lastName)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          id="vendedor-detail-title"
                          className="truncate text-lg font-bold text-[#212121] dark:text-white"
                        >
                          {loading
                            ? "Cargando…"
                            : user
                              ? formatName(
                                  user.name,
                                  user.lastName,
                                  user.secondLastName,
                                )
                              : "Vendedor"}
                        </h3>
                        {user?.company?.name && (
                          <p className="mt-0.5 truncate text-sm text-[#616161] dark:text-[#b0b0b0]">
                            {user.company.name}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#616161] transition-colors hover:bg-[#f5f5f5] hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a] dark:hover:text-white"
                        aria-label="Cerrar"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} size={22} />
                      </button>
                    </div>
                    {user && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {user.salesPersonVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} />
                            Verificado
                          </span>
                        )}
                        {user.salesComission != null && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                            <HugeiconsIcon icon={PercentCircleIcon} size={14} />
                            {user.salesComission}% comisión
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div
                  role="tablist"
                  aria-label="Secciones del vendedor"
                  className="flex gap-1 overflow-x-auto px-3 pb-2 sm:px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {tabs.map((tab) => {
                    const selected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.97] ${
                          selected
                            ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                            : "text-[#616161] hover:bg-[#f5f5f5] dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a]"
                        }`}
                      >
                        {tab.label}
                        {tab.count != null && (
                          <span
                            className={`tabular-nums text-xs ${
                              selected
                                ? "text-white/90"
                                : "text-[#9e9e9e] dark:text-[#777]"
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
                {loading ? (
                  <div className="space-y-3 py-2" aria-busy="true">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-16 animate-pulse rounded-xl bg-[#f0f0f0] dark:bg-[#2a2a2a]"
                      />
                    ))}
                  </div>
                ) : !user ? (
                  <EmptyBlock message="No se encontró el vendedor." />
                ) : (
                  <>
                    {activeTab === "resumen" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {(
                            [
                              {
                                id: "clientes" as const,
                                label: "Clientes",
                                value: counts.clientes,
                                icon: Chart01Icon,
                              },
                              {
                                id: "actividad" as const,
                                label: "Actividad",
                                value: counts.actividad,
                                icon: Calendar03Icon,
                              },
                              {
                                id: "propuestas" as const,
                                label: "Propuestas",
                                value: counts.propuestas,
                                icon: FileAttachmentIcon,
                              },
                              {
                                id: "seguimientos" as const,
                                label: "Seguimientos",
                                value: counts.seguimientos,
                                icon: Task01Icon,
                              },
                            ] as const
                          ).map((stat) => (
                            <button
                              key={stat.id}
                              type="button"
                              onClick={() => setActiveTab(stat.id)}
                              className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-3 text-left transition-[transform,border-color,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:border-orange-500/40 hover:bg-orange-500/[0.04] active:scale-[0.98] dark:border-[#333] dark:bg-[#252525] dark:hover:border-orange-500/40"
                            >
                              <span className="flex items-center gap-1.5 text-[#9e9e9e] dark:text-[#888]">
                                <HugeiconsIcon icon={stat.icon} size={14} />
                                <span className="text-[11px] font-medium uppercase tracking-wide">
                                  {stat.label}
                                </span>
                              </span>
                              <p className="mt-1 text-2xl font-semibold tabular-nums text-[#212121] dark:text-white">
                                {stat.value}
                              </p>
                            </button>
                          ))}
                        </div>

                        <section className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                            Contacto
                          </h4>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            {user.email ? (
                              <a
                                href={`mailto:${user.email}`}
                                className="inline-flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-[#e0e0e0] px-3 py-2.5 text-sm text-[#212121] transition-colors hover:border-orange-500/40 hover:bg-orange-500/[0.04] dark:border-[#3a3a3a] dark:text-white"
                              >
                                <HugeiconsIcon icon={Mail01Icon} size={18} />
                                <span className="truncate">{user.email}</span>
                              </a>
                            ) : (
                              <div className="inline-flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-dashed border-[#e0e0e0] px-3 py-2.5 text-sm text-[#9e9e9e] dark:border-[#3a3a3a]">
                                <HugeiconsIcon icon={Mail01Icon} size={18} />
                                Sin email
                              </div>
                            )}
                            {user.phone ? (
                              <a
                                href={`tel:${user.phone}`}
                                className="inline-flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-[#e0e0e0] px-3 py-2.5 text-sm text-[#212121] transition-colors hover:border-orange-500/40 hover:bg-orange-500/[0.04] dark:border-[#3a3a3a] dark:text-white"
                              >
                                <HugeiconsIcon icon={CallIcon} size={18} />
                                {user.phone}
                              </a>
                            ) : (
                              <div className="inline-flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-dashed border-[#e0e0e0] px-3 py-2.5 text-sm text-[#9e9e9e] dark:border-[#3a3a3a]">
                                <HugeiconsIcon icon={CallIcon} size={18} />
                                Sin teléfono
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {user.username && (
                              <MetaChip>@{user.username}</MetaChip>
                            )}
                            <MetaChip>
                              Alta {formatDateShort(user.createdAt, false)}
                            </MetaChip>
                            {user.birthday && (
                              <MetaChip>
                                Nac. {formatDateShort(user.birthday, false)}
                              </MetaChip>
                            )}
                          </div>
                        </section>

                        <section className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                              Actividad reciente
                            </h4>
                            {counts.actividad > 0 && (
                              <button
                                type="button"
                                onClick={() => setActiveTab("actividad")}
                                className="inline-flex min-h-9 items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400"
                              >
                                Ver todo
                                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                              </button>
                            )}
                          </div>
                          {recentActivities.length === 0 ? (
                            <EmptyBlock message="Aún no hay actividades registradas." />
                          ) : (
                            <ul className="space-y-2">
                              {recentActivities.map((a) => (
                                <li
                                  key={a.id}
                                  className="rounded-xl border border-[#e8e8e8] px-3 py-2.5 dark:border-[#333]"
                                >
                                  <p className="text-sm font-medium text-[#212121] dark:text-white">
                                    {a.type}
                                    {a.businessLead?.businessName
                                      ? ` · ${a.businessLead.businessName}`
                                      : ""}
                                  </p>
                                  <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                                    {formatDateShort(a.activityDate, false)}
                                    {a.result ? ` · ${a.result}` : ""}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>

                        <section className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                              Próximos seguimientos
                            </h4>
                            {counts.seguimientos > 0 && (
                              <button
                                type="button"
                                onClick={() => setActiveTab("seguimientos")}
                                className="inline-flex min-h-9 items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400"
                              >
                                Ver todo
                                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                              </button>
                            )}
                          </div>
                          {upcomingFollowUps.length === 0 ? (
                            <EmptyBlock message="Sin seguimientos programados." />
                          ) : (
                            <ul className="space-y-2">
                              {upcomingFollowUps.map((t) => (
                                <li
                                  key={t.id}
                                  className="rounded-xl border border-[#e8e8e8] px-3 py-2.5 dark:border-[#333]"
                                >
                                  <p className="text-sm font-medium text-[#212121] dark:text-white">
                                    {t.businessLead?.businessName ?? "Cliente"}
                                  </p>
                                  <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                                    {formatDateShort(t.scheduledDate, false)} ·{" "}
                                    {t.status}
                                    {t.priority ? ` · ${t.priority}` : ""}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>
                      </div>
                    )}

                    {activeTab === "clientes" && (
                      <div className="space-y-2">
                        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                          Clientes asignados a este vendedor.
                        </p>
                        {user.techStatusBusinessLeads.length === 0 ? (
                          <EmptyBlock message="Sin clientes asignados." />
                        ) : (
                          <ul className="space-y-2">
                            {user.techStatusBusinessLeads.map((s) => {
                              const leadId = s.businessLead?.id;
                              const name =
                                s.businessLead?.businessName ?? "Cliente";
                              return (
                                <li
                                  key={s.id}
                                  className="flex flex-col gap-2 rounded-xl border border-[#e8e8e8] p-3 dark:border-[#333] sm:flex-row sm:items-center"
                                >
                                  <div className="min-w-0 flex-1 space-y-1.5">
                                    {leadId ? (
                                      <Link
                                        href={Routes.panelLead(leadId)}
                                        onClick={onClose}
                                        className="block truncate text-sm font-semibold text-[#212121] hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                                      >
                                        {name}
                                      </Link>
                                    ) : (
                                      <p className="truncate text-sm font-semibold text-[#212121] dark:text-white">
                                        {name}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-1.5">
                                      {s.pipelineStatus && (
                                        <span
                                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            PIPELINE_STATUS_COLORS[
                                              s.pipelineStatus
                                            ] ??
                                            "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
                                          }`}
                                        >
                                          {s.pipelineStatus}
                                        </span>
                                      )}
                                      {s.opportunityLevel && (
                                        <MetaChip>{s.opportunityLevel}</MetaChip>
                                      )}
                                    </div>
                                  </div>
                                  {canUnassign && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUnassignLead(
                                          s.id,
                                          s.salesPerson,
                                          s.businessLead?.id,
                                        )
                                      }
                                      disabled={unassigningLeadId === s.id}
                                      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] px-3 text-sm font-medium text-[#616161] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#3a3a3a] dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                    >
                                      {unassigningLeadId === s.id ? (
                                        <span className="size-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                                      ) : (
                                        <HugeiconsIcon
                                          icon={UserRemove01Icon}
                                          size={16}
                                        />
                                      )}
                                      Desasignar
                                    </button>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    )}

                    {activeTab === "actividad" && (
                      <div className="space-y-2">
                        {user.salesActivities.length === 0 ? (
                          <EmptyBlock message="Sin actividades registradas." />
                        ) : (
                          <ul className="space-y-2">
                            {[...user.salesActivities]
                              .sort(
                                (a, b) =>
                                  new Date(b.activityDate).getTime() -
                                  new Date(a.activityDate).getTime(),
                              )
                              .map((a) => (
                                <li
                                  key={a.id}
                                  className="rounded-xl border border-[#e8e8e8] px-3 py-3 dark:border-[#333]"
                                >
                                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <p className="text-sm font-semibold text-[#212121] dark:text-white">
                                      {a.type}
                                    </p>
                                    <p className="text-xs text-[#9e9e9e]">
                                      {formatDateShort(a.activityDate, false)}
                                    </p>
                                  </div>
                                  {a.businessLead?.businessName && (
                                    <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
                                      {a.businessLead.businessName}
                                    </p>
                                  )}
                                  {(a.result || a.comments) && (
                                    <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
                                      {[a.result, a.comments]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    </p>
                                  )}
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {activeTab === "propuestas" && (
                      <div className="space-y-2">
                        {user.proposals.length === 0 ? (
                          <EmptyBlock message="Sin propuestas." />
                        ) : (
                          <ul className="space-y-2">
                            {user.proposals.map((p) => (
                              <li
                                key={p.id}
                                className="rounded-xl border border-[#e8e8e8] p-3 dark:border-[#333]"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#212121] dark:text-white">
                                      {p.businessLead?.businessName ?? "Cliente"}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                                      {formatDateShort(p.sentDate, false)} ·{" "}
                                      {p.status}
                                      {p.amount != null
                                        ? ` · $${p.amount.toLocaleString("es-MX")}`
                                        : ""}
                                    </p>
                                  </div>
                                  {updatingProposalId === p.id && (
                                    <span className="size-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                                  )}
                                </div>
                                {(p.status === PROPOSAL_STATUS.COMPRADA ||
                                  (p.approved ?? false)) && (
                                  <div className="mt-3 flex flex-col gap-2 border-t border-[#f0f0f0] pt-3 dark:border-[#333] sm:flex-row sm:flex-wrap">
                                    {p.status === PROPOSAL_STATUS.COMPRADA && (
                                      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-1">
                                        <input
                                          type="checkbox"
                                          checked={p.approved ?? false}
                                          disabled={updatingProposalId === p.id}
                                          onChange={(e) =>
                                            handleApprovedChange(
                                              p.id,
                                              e.target.checked,
                                            )
                                          }
                                          className="size-4 rounded border-[#e0e0e0] text-orange-500 focus:ring-orange-500 disabled:opacity-50 dark:border-[#3a3a3a]"
                                        />
                                        <span className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                                          Aprobar propuesta
                                        </span>
                                      </label>
                                    )}
                                    {(p.approved ?? false) && (
                                      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-1">
                                        <input
                                          type="checkbox"
                                          checked={p.paid ?? false}
                                          disabled={updatingProposalId === p.id}
                                          onChange={(e) =>
                                            handlePaidChange(
                                              p.id,
                                              e.target.checked,
                                            )
                                          }
                                          className="size-4 rounded border-[#e0e0e0] text-orange-500 focus:ring-orange-500 disabled:opacity-50 dark:border-[#3a3a3a]"
                                        />
                                        <span className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                                          Comisión pagada
                                        </span>
                                      </label>
                                    )}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {activeTab === "seguimientos" && (
                      <div className="space-y-2">
                        {user.followUpTasks.length === 0 ? (
                          <EmptyBlock message="Sin tareas de seguimiento." />
                        ) : (
                          <ul className="space-y-2">
                            {[...user.followUpTasks]
                              .sort(
                                (a, b) =>
                                  new Date(a.scheduledDate).getTime() -
                                  new Date(b.scheduledDate).getTime(),
                              )
                              .map((t) => (
                                <li
                                  key={t.id}
                                  className="rounded-xl border border-[#e8e8e8] px-3 py-3 dark:border-[#333]"
                                >
                                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <p className="text-sm font-semibold text-[#212121] dark:text-white">
                                      {t.businessLead?.businessName ?? "Cliente"}
                                    </p>
                                    <p className="text-xs text-[#9e9e9e]">
                                      {formatDateShort(t.scheduledDate, false)}
                                    </p>
                                  </div>
                                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    <MetaChip>{t.status}</MetaChip>
                                    {t.priority && (
                                      <MetaChip>{t.priority}</MetaChip>
                                    )}
                                  </div>
                                  {t.notes && (
                                    <p className="mt-2 text-xs text-[#616161] dark:text-[#b0b0b0]">
                                      {t.notes}
                                    </p>
                                  )}
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
