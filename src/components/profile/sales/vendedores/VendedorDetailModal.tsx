"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
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
import { PIPELINE_STATUS_COLORS, PLAN_FEATURE_KEYS, PROPOSAL_STATUS } from "kadesh/constants/constans";
import { formatDateShort } from "kadesh/utils/format-date";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Mail01Icon,
  CallIcon,
  Cancel01Icon,
  Building01Icon,
  Chart01Icon,
  Calendar03Icon,
  FileAttachmentIcon,
  Task01Icon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons";
import { hasPlanFeature } from "../helpers/plan-features";
import { useSubscription } from "../SubscriptionContext";
import { useUser } from "kadesh/utils/UserContext";
import { Role } from "kadesh/constants/constans";

interface VendedorDetailModalProps {
  vendedorId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatName(
  name: string,
  lastName: string | null,
  secondLastName: string | null
): string {
  return [name, lastName, secondLastName].filter(Boolean).join(" ");
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 py-2">
      {icon && (
        <span className="text-[#616161] dark:text-[#b0b0b0] shrink-0 mt-0.5">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">{label}</p>
        <p className="text-sm font-medium text-[#212121] dark:text-white break-words">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] p-4">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-[#212121] dark:text-white mb-3">
        {icon}
        {title}
      </h4>
      {children}
    </section>
  );
}

export default function VendedorDetailModal({
  vendedorId,
  isOpen,
  onClose,
}: VendedorDetailModalProps) {
  const { user: currentUser, refreshUser } = useUser();
  const { subscription } = useSubscription();

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

  const isAdminCompany = currentUser?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;

  const [updatingProposalId, setUpdatingProposalId] = useState<string | null>(null);
  const [unassigningLeadId, setUnassigningLeadId] = useState<string | null>(null);

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="vendedor-detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="vendedor-detail-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] shrink-0">
            <h3 className="text-lg font-bold text-[#212121] dark:text-white">
              Detalle del vendedor
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#616161] dark:text-[#b0b0b0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] hover:text-[#212121] dark:hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={24} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <span className="animate-spin size-10 border-2 border-orange-500 border-t-transparent rounded-full" />
              </div>
            ) : !user ? (
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0] py-4">
                No se encontró el vendedor.
              </p>
            ) : (
              <>
                <Section
                  title="Datos personales"
                  icon={<HugeiconsIcon icon={UserIcon} size={20} />}
                >
                  <DetailRow
                    label="Nombre completo"
                    value={formatName(user.name, user.lastName, user.secondLastName)}
                  />
                  <DetailRow label="Usuario" value={user.username} />
                  <DetailRow
                    label="Email"
                    value={
                      user.email ? (
                        <a
                          href={`mailto:${user.email}`}
                          className="text-orange-500 dark:text-orange-400 hover:underline"
                        >
                          {user.email}
                        </a>
                      ) : (
                        "—"
                      )
                    }
                    icon={<HugeiconsIcon icon={Mail01Icon} size={18} />}
                  />
                  <DetailRow
                    label="Teléfono"
                    value={user.phone}
                    icon={<HugeiconsIcon icon={CallIcon} size={18} />}
                  />
                  <DetailRow label="Edad" value={user.age} />
                  <DetailRow
                    label="Fecha de nacimiento"
                    value={
                      user.birthday
                        ? formatDateShort(user.birthday, false)
                        : "—"
                    }
                  />
                  <DetailRow
                    label="Alta en el sistema"
                    value={formatDateShort(user.createdAt, true)}
                  />
                  <DetailRow
                    label="Comisión"
                    value={
                      user.salesComission != null
                        ? `${user.salesComission}%`
                        : "—"
                    }
                  />
                  {user.salesPersonVerified && (
                    <p className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                      Vendedor verificado
                    </p>
                  )}
                </Section>

                {user.company && (
                  <Section
                    title="Empresa"
                    icon={<HugeiconsIcon icon={Building01Icon} size={20} />}
                  >
                    <DetailRow label="Nombre" value={user.company.name} />
                    <DetailRow label="ID" value={user.company.id} />
                  </Section>
                )}

                <Section
                  title="Leads asignados"
                  icon={<HugeiconsIcon icon={Chart01Icon} size={20} />}
                >
                  {user.techStatusBusinessLeads.length === 0 ? (
                    <p className="text-sm text-[#616161] dark:text-[#b0b0b0] py-2">
                      Sin leads asignados
                    </p>
                  ) : (
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {user.techStatusBusinessLeads.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center gap-2 py-2 border-b border-[#e8e8e8] dark:border-[#333] last:border-0"
                        >
                          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
                            <span className="font-medium text-[#212121] dark:text-white text-sm">
                              {s.businessLead?.businessName ?? "—"}
                            </span>
                            {s.pipelineStatus && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  PIPELINE_STATUS_COLORS[s.pipelineStatus] ??
                                  "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
                                }`}
                              >
                                {s.pipelineStatus}
                              </span>
                            )}
                            {s.opportunityLevel && (
                              <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                                {s.opportunityLevel}
                              </span>
                            )}
                          </div>
                          {hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.ASSIGN_SALES_PERSON) && isAdminCompany && (
                          <button
                            type="button"
                            onClick={() => handleUnassignLead(s.id, s.salesPerson, s.businessLead?.id)}
                            disabled={unassigningLeadId === s.id}
                            title="Desasignar vendedor"
                            className="shrink-0 flex items-center justify-center rounded-lg p-1.5 text-[#9e9e9e] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {unassigningLeadId === s.id ? (
                              <span className="size-4 block animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                            ) : (
                                <HugeiconsIcon icon={UserRemove01Icon} size={16} />
                              )}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <Section
                  title="Actividades de ventas"
                  icon={<HugeiconsIcon icon={Calendar03Icon} size={20} />}
                >
                  {user.salesActivities.length === 0 ? (
                    <p className="text-sm text-[#616161] dark:text-[#b0b0b0] py-2">
                      Sin actividades registradas
                    </p>
                  ) : (
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                      {user.salesActivities.map((a) => (
                        <li
                          key={a.id}
                          className="py-2 border-b border-[#e8e8e8] dark:border-[#333] last:border-0 text-sm"
                        >
                          <span className="font-medium text-[#212121] dark:text-white">
                            {a.type}
                          </span>
                          {a.businessLead?.businessName && (
                            <span className="text-[#616161] dark:text-[#b0b0b0]">
                              {" "}
                              · {a.businessLead.businessName}
                            </span>
                          )}
                          <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                            {formatDateShort(a.activityDate, false)}
                            {a.result && ` · ${a.result}`}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <Section
                  title="Propuestas"
                  icon={<HugeiconsIcon icon={FileAttachmentIcon} size={20} />}
                >
                  {user.proposals.length === 0 ? (
                    <p className="text-sm text-[#616161] dark:text-[#b0b0b0] py-2">
                      Sin propuestas
                    </p>
                  ) : (
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                      {user.proposals.map((p) => (
                        <li
                          key={p.id}
                          className="py-2 border-b border-[#e8e8e8] dark:border-[#333] last:border-0 text-sm"
                        >
                          <span className="font-medium text-[#212121] dark:text-white">
                            {p.businessLead?.businessName ?? "—"}
                          </span>
                          <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                            {formatDateShort(p.sentDate, false)} · {p.status}
                            {p.amount != null && ` · $${p.amount}`}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-4">
                            {p.status === PROPOSAL_STATUS.COMPRADA && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={p.approved ?? false}
                                  disabled={updatingProposalId === p.id}
                                  onChange={(e) =>
                                    handleApprovedChange(p.id, e.target.checked)
                                  }
                                  className="rounded border-[#e0e0e0] dark:border-[#3a3a3a] text-orange-500 focus:ring-orange-500 disabled:opacity-50"
                                />
                                <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                                  Aprobar propuesta
                                </span>
                              </label>
                            )}
                            {(p.approved ?? false) && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={p.paid ?? false}
                                  disabled={updatingProposalId === p.id}
                                  onChange={(e) =>
                                    handlePaidChange(p.id, e.target.checked)
                                  }
                                  className="rounded border-[#e0e0e0] dark:border-[#3a3a3a] text-orange-500 focus:ring-orange-500 disabled:opacity-50"
                                />
                                <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                                  Comisión pagada
                                </span>
                              </label>
                            )}
                            {updatingProposalId === p.id && (
                              <span className="inline-block size-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <Section
                  title="Tareas de seguimiento"
                  icon={<HugeiconsIcon icon={Task01Icon} size={20} />}
                >
                  {user.followUpTasks.length === 0 ? (
                    <p className="text-sm text-[#616161] dark:text-[#b0b0b0] py-2">
                      Sin tareas de seguimiento
                    </p>
                  ) : (
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                      {user.followUpTasks.map((t) => (
                        <li
                          key={t.id}
                          className="py-2 border-b border-[#e8e8e8] dark:border-[#333] last:border-0 text-sm"
                        >
                          <span className="font-medium text-[#212121] dark:text-white">
                            {t.businessLead?.businessName ?? "—"}
                          </span>
                          <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                            {formatDateShort(t.scheduledDate, false)} · {t.status}
                            {t.priority && ` · ${t.priority}`}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
