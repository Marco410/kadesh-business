"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import {
  TECH_PROPOSAL_QUERY,
  type TechProposalVariables,
  type TechProposalResponse,
} from "kadesh/components/profile/sales/queries";
import { Routes } from "kadesh/core/routes";
import { formatDateShort } from "kadesh/utils/format-date";
import { hasPlanFeature } from "../helpers/plan-features";
import { PLAN_FEATURE_KEYS } from "kadesh/constants/constans";
import { useSubscription } from "../SubscriptionContext";

interface ProposalDetailModalProps {
  proposalId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProposalDetailModal({
  proposalId,
  isOpen,
  onClose,
}: ProposalDetailModalProps) {
  const { subscription } = useSubscription();
  const { data, loading } = useQuery<
    TechProposalResponse,
    TechProposalVariables
  >(TECH_PROPOSAL_QUERY, {
    variables: { where: { id: proposalId ?? "" } },
    skip: !isOpen || !proposalId,
  });

  const proposal = data?.techProposal ?? null;

  if (!isOpen) return null;

  const hasProjectsFeature = hasPlanFeature(
    subscription?.planFeatures ?? null,
    PLAN_FEATURE_KEYS.PROJECTS
  ) || false;

  return (
    <AnimatePresence>
      <motion.div
        key="proposal-detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="proposal-detail-content"
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
              Detalle de propuesta
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
            ) : !proposal ? (
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                No se encontró la propuesta.
              </p>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Fecha envío
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                    {formatDateShort(proposal.sentDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Monto
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                    {proposal.amount != null
                      ? `$${Number(proposal.amount).toLocaleString("es-MX")}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Estado
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                    {proposal.status}
                  </p>
                </div>
              {proposal.product && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Producto
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff] whitespace-pre-wrap">
                    {proposal.product}
                  </p>
                </div>
              )}
                {proposal.businessLead && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                      Empresa
                    </p>
                    <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                      {proposal.businessLead.businessName}
                    </p>
                  </div>
                )}

                {proposal.project?.id && hasProjectsFeature && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                      Proyecto
                    </p>
                    <Link
                      href={Routes.panelProject(proposal.project.id)}
                      className="text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium hover:underline"
                    >
                      Ver proyecto →
                    </Link>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                  URL / archivo
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff] whitespace-pre-wrap break-all">
                    {proposal.fileOrUrl ? (
                      <a
                        href={proposal.fileOrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline"
                      >
                        {proposal.fileOrUrl}
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
              {proposal.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Notas
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff] whitespace-pre-wrap">
                    {proposal.notes}
                  </p>
                </div>
              )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                    Registrado
                  </p>
                  <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                    {formatDateShort(proposal.createdAt)}
                  </p>
                </div>
                {proposal.updatedAt && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">
                      Actualizado
                    </p>
                    <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                      {formatDateShort(proposal.updatedAt)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
