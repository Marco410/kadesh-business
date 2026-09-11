"use client";

import { DailyDigestCard } from "kadesh/components/panel/dashboard/DailyDigestCard";
import { useRemainingCredits } from "kadesh/components/panel/hooks";
import { AiCompanyKnowledgeCard } from "./AiCompanyKnowledgeCard";
import { AiRecommendationsCard } from "./AiRecommendationsCard";

type AiDashboardTabProps = {
  companyId: string;
  canManageAi: boolean;
  isCompanyWide: boolean;
  onOpenSettings: () => void;
  onOpenCompanyInfo: () => void;
};

/**
 * Hub de Kadesh AI: digest y recomendaciones a la izquierda; lo que ya sabe del negocio a la derecha.
 */
export function AiDashboardTab({
  companyId,
  canManageAi,
  isCompanyWide,
  onOpenSettings,
  onOpenCompanyInfo,
}: AiDashboardTabProps) {
  const { remainingQuota, refetch } = useRemainingCredits(companyId);

  return (
    <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
      <div className="space-y-4">
        <DailyDigestCard
          companyId={companyId}
          canManageAi={canManageAi}
          isCompanyWide={isCompanyWide}
          remainingQuota={remainingQuota}
          onGenerated={() => void refetch()}
          onConfigure={onOpenSettings}
        />
        <AiRecommendationsCard
          companyId={companyId}
          onOpenSettings={onOpenSettings}
          onOpenCompanyInfo={onOpenCompanyInfo}
        />
      </div>
      <AiCompanyKnowledgeCard
        companyId={companyId}
        onOpenCompanyInfo={onOpenCompanyInfo}
      />
    </div>
  );
}
