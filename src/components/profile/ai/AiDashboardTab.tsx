"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DailyDigestCard } from "kadesh/components/panel/dashboard/DailyDigestCard";
import { useRemainingCredits } from "kadesh/components/panel/hooks";
import { AiCompanyKnowledgeCard } from "./AiCompanyKnowledgeCard";
import { AiRecommendationsCard } from "./AiRecommendationsCard";
import {
  aiFadeUpVariants,
  aiMotionTransition,
  aiStaggerContainer,
} from "./motion";

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
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]"
      variants={aiStaggerContainer(reduce, 0.04)}
      initial="hidden"
      animate="show"
    >
      <motion.div
        className="min-w-0 space-y-4"
        variants={aiFadeUpVariants(reduce)}
        transition={aiMotionTransition(reduce)}
      >
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
      </motion.div>
      <motion.div
        className="min-w-0"
        variants={aiFadeUpVariants(reduce)}
        transition={aiMotionTransition(reduce)}
      >
        <AiCompanyKnowledgeCard
          companyId={companyId}
          onOpenCompanyInfo={onOpenCompanyInfo}
        />
      </motion.div>
    </motion.div>
  );
}
