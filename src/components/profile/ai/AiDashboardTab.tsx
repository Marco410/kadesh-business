"use client";

import { DailyDigestCard } from "kadesh/components/panel/dashboard/DailyDigestCard";
import { useRemainingCredits } from "kadesh/components/panel/hooks";
import { AiRecommendationsCard } from "./AiRecommendationsCard";

type AiDashboardTabProps = {
  companyId: string;
  canManageAi: boolean;
  isCompanyWide: boolean;
  onOpenSettings: () => void;
  onOpenCompanyInfo: () => void;
};

/**
 * Hub de Kadesh AI: resumen del día y recomendaciones de industria/perfil.
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
  );
}
