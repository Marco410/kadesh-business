"use client";

import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, UserAdd02Icon } from "@hugeicons/core-free-icons";

import {
  TECH_BUSINESS_LEADS_COUNT_QUERY,
  TECH_PROPOSALS_QUERY,
  type TechBusinessLeadsCountVariables,
  type TechBusinessLeadsCountResponse,
  type TechProposalsResponse,
  type TechProposalsBySellerVariables,
} from "kadesh/components/profile/sales/queries";
import { PIPELINE_STATUS, PLAN_FEATURE_KEYS, PROPOSAL_STATUS } from "./constants";
import { formatCurrency } from "kadesh/utils/format-currency";
import { Routes } from "kadesh/core/routes";
import { useRouter } from "next/navigation";
import { hasPlanFeature } from "./helpers/plan-features";
import { useSubscription } from "./SubscriptionContext";

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
    .filter((p) => p.status === PROPOSAL_STATUS.COMPRADA)
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const comisionesSinCierre = allProposals
    .filter((p) => p.status !== PROPOSAL_STATUS.COMPRADA)
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const clientesGanados = clientesGanadosData?.techBusinessLeadsCount ?? 0;
  const contactados = contactadosData?.techBusinessLeadsCount ?? 0;



  const hasPlanFeaturesRequired = hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.LEAD_SYNC) || hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.SALES_PERSON_MANAGEMENT);
  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 ">
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Clientes ganados
          </p>
          <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
            {clientesGanados}
          </p>
        </div>
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Mis comisiones
          </p>
          <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
            {formatCurrency(ganancias * salesComission / 100)}
          </p>
        </div>
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Comisiones sin cierre
          </p>
          <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
            {formatCurrency(comisionesSinCierre * salesComission / 100)}
          </p>
        </div>
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Contactados
          </p>
          <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
            {contactados}
          </p>
        </div>
      </div>
      {(isAdminCompany && hasPlanFeaturesRequired) && (
      <div className="flex flex-col sm:flex-row rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm items-stretch sm:items-center justify-between gap-4">
         {
         hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.LEAD_SYNC) && <div className="flex flex-col gap-1 min-w-0">
          <button
            type="button"
            onClick={() => router.push(Routes.panelSyncLeads)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e] transition-colors w-full sm:w-auto"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={2} />
            Obtener nuevos clientes
          </button>
        </div>
        }
        {
          hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.SALES_PERSON_MANAGEMENT) && <div className="flex flex-col gap-1 min-w-0">
          <button
            type="button"
            onClick={() => router.push(Routes.panelAddSalesperson)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e] transition-colors w-full sm:w-auto"
          >
            <HugeiconsIcon icon={UserAdd02Icon} size={18} strokeWidth={2} />
            Vendedores 
          </button>
        </div>
        }
        <div className="flex flex-col items-end justify-center border-t border-[#e0e0e0] dark:border-[#3a3a3a] pt-4 sm:pt-0 sm:border-t-0">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Total clientes
          </p>
          <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
            {leadsCount}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
