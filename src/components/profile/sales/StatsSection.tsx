"use client";

import { useQuery } from "@apollo/client";
import {
  TECH_BUSINESS_LEADS_COUNT_QUERY,
  TECH_PROPOSALS_QUERY,
  type TechBusinessLeadsCountVariables,
  type TechBusinessLeadsCountResponse,
  type TechProposalsResponse,
  type TechProposalsBySellerVariables,
} from "kadesh/components/profile/sales/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import { useWorkspaceContext } from "kadesh/components/profile/sales/workspaces/WorkspaceContext";
import { PIPELINE_STATUS, PLAN_FEATURE_KEYS, PROPOSAL_STATUS } from "kadesh/constants/constans";
import { formatCurrency } from "kadesh/utils/format-currency";
import { useRouter } from "next/navigation";
import { useSubscription } from "./SubscriptionContext";
import { InfoTooltip } from "kadesh/components/shared";

interface StatsSectionProps {
  userId: string;
  companyId: string | null;
  isAdminCompany: boolean;
  /** Admin empresa o user_company: conteos de leads a nivel empresa (misma lógica que la tabla). */
  companyWideLeadScope?: boolean;
  salesComission: number;
}

export default function StatsSection({
  userId,
  companyId,
  isAdminCompany,
  companyWideLeadScope,
  salesComission,
}: StatsSectionProps) {
  const router = useRouter();
  const { subscription } = useSubscription();
  const { currentWorkspaceId } = useWorkspaceContext();

  const scopeLeadsByCompany = companyWideLeadScope ?? isAdminCompany;

  const where = {
    ...(!scopeLeadsByCompany ? { salesPerson: { some: { id: { equals: userId } } } } : {}),
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
  
  const proposalsWhere = mergeWorkspaceFilter(
    { assignedSeller: { id: { equals: userId } } },
    currentWorkspaceId
  );

  const { data: proposalsData } = useQuery<
    TechProposalsResponse,
    TechProposalsBySellerVariables
  >(TECH_PROPOSALS_QUERY, {
    variables: {
      where: proposalsWhere,
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
    </div>
  );
}
