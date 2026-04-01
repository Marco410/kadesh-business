"use client";

import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, MapsSearchIcon, UserAdd02Icon, UserSearch01Icon } from "@hugeicons/core-free-icons";

import {
  TECH_BUSINESS_LEADS_COUNT_QUERY,
  TECH_PROPOSALS_QUERY,
  type TechBusinessLeadsCountVariables,
  type TechBusinessLeadsCountResponse,
  type TechProposalsResponse,
  type TechProposalsBySellerVariables,
} from "kadesh/components/profile/sales/queries";
import { PIPELINE_STATUS, PLAN_FEATURE_KEYS, PROPOSAL_STATUS } from "kadesh/constants/constans";
import { formatCurrency } from "kadesh/utils/format-currency";
import { Routes } from "kadesh/core/routes";
import { useRouter } from "next/navigation";
import { hasPlanFeature } from "./helpers/plan-features";
import { useSubscription } from "./SubscriptionContext";
import { InfoTooltip } from "kadesh/components/shared";

interface StatsSectionProps {
  userId: string;
  companyId: string | null;
  isAdminCompany: boolean;
  salesComission: number;
}

export default function StatsSection({ userId, companyId, isAdminCompany, salesComission }: StatsSectionProps) {
  const router = useRouter();
  const { subscription } = useSubscription();

  const where = {
    ...(!isAdminCompany ? { salesPerson: { some: { id: { equals: userId } } } } : {}),
    ...(companyId != null && {
      saasCompany: { some: { id: { equals: companyId } } },
    }),
   
  };

  const { data: leadsCountData } = useQuery<
    TechBusinessLeadsCountResponse,
    TechBusinessLeadsCountVariables
  >(TECH_BUSINESS_LEADS_COUNT_QUERY, {
    variables: { where },
    skip: !userId,
  });

  const leadsCount = leadsCountData?.techBusinessLeadsCount ?? 0;
  
  const { data: proposalsData } = useQuery<
    TechProposalsResponse,
    TechProposalsBySellerVariables
  >(TECH_PROPOSALS_QUERY, {
    variables: {
      where: {
        assignedSeller: { id: { equals: userId } },
      },
    },
    skip: !userId,
  });

  const { data: contactadosData } = useQuery<
    TechBusinessLeadsCountResponse,
    TechBusinessLeadsCountVariables
  >(TECH_BUSINESS_LEADS_COUNT_QUERY, {
    variables: {
      where: {
        salesPerson: { some: { id: { equals: userId } } },
        status: { firstContactDate: { not: null } },
      },
    },
    skip: !userId,
  });

  const { data: clientesGanadosData } = useQuery<
    TechBusinessLeadsCountResponse,
    TechBusinessLeadsCountVariables
  >(TECH_BUSINESS_LEADS_COUNT_QUERY, {
    variables: {
      where: {
        salesPerson: { some: { id: { equals: userId } } },
        status: { pipelineStatus: { equals: PIPELINE_STATUS.CERRADO_GANADO } },
      },
    },
    skip: !userId,
  });

  const allProposals = proposalsData?.techProposals ?? [];

  const ganancias = allProposals
    .filter((p) => p.status === PROPOSAL_STATUS.COMPRADA && p.approved && !p.paid)
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const comisionesSinCierre = allProposals
    .filter((p) => (p.status === PROPOSAL_STATUS.ENVIADA || p.status === PROPOSAL_STATUS.PENDIENTE))
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const clientesGanados = clientesGanadosData?.techBusinessLeadsCount ?? 0;
  const contactados = contactadosData?.techBusinessLeadsCount ?? 0;



  const hasPlanFeaturesRequired = hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.LEAD_SYNC) || hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.SALES_PERSON_MANAGEMENT);
  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 overflow-visible">
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Clientes ganados <InfoTooltip text="Clientes ganados son los leads que han sido cerrados como ganados por el vendedor." />
          </p>
          <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
            {clientesGanados}
          </p>
        </div>
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm justify-between flex flex-row overflow-visible">
          <div className="flex flex-col items-start gap-1.5">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0] flex items-center gap-1.5">
            Mis comisiones
            <InfoTooltip text="Comisión sobre propuestas con estado Comprada, no pagadas y aprobadas por el administrador." />
            </p>
            <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
              {formatCurrency(ganancias * salesComission / 100)}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm justify-between flex flex-row overflow-visible">
          <div className="flex flex-col items-start gap-1.5">
            <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0] flex items-center gap-1.5">
              Comisiones sin cierre
              <InfoTooltip text="Comisión sobre propuestas con estado Enviada o Pendiente." />
            </p>
            <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
              {formatCurrency(comisionesSinCierre * salesComission / 100)}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Contactados <InfoTooltip text="Contactados son los leads que se han contactado por primera vez por el vendedor. En los detalles del lead en 'Primer contacto'" />
          </p>
          <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
            {contactados}
          </p>
        </div>
      </div>
      {(isAdminCompany && hasPlanFeaturesRequired) && (
      <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm bg-gradient-to-r from-orange-500/10 to-transparent dark:from-orange-500/20 dark:to-transparent">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <p className="text-xs uppercase tracking-wide font-semibold text-[#9e9e9e] dark:text-white">
              Acciones rápidas
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              {hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.LEAD_SYNC) && (
                <button
                  type="button"
                  onClick={() => router.push(Routes.panelSyncLeads)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e] transition-colors w-full sm:w-auto"
                >
                  <HugeiconsIcon icon={UserSearch01Icon} size={18} strokeWidth={2} />
                  Obtener nuevos clientes
                </button>
              )}
              {hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.SALES_PERSON_MANAGEMENT) && (
                <button
                  type="button"
                  onClick={() => router.push(Routes.panelAddSalesperson)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e] transition-colors w-full sm:w-auto"
                >
                  <HugeiconsIcon icon={UserAdd02Icon} size={18} strokeWidth={2} />
                  Gestionar vendedores
                </button>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] px-4 py-3 min-w-[11rem] lg:min-w-[12.5rem]">
            <p className="text-xs uppercase tracking-wide font-semibold text-[#9e9e9e] dark:text-[#8b8b8b]">
              Total clientes
            </p>
            <p className="text-3xl font-bold text-[#212121] dark:text-[#ffffff] mt-1 tabular-nums">
              {leadsCount}
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
