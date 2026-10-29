"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRemainingCredits } from "kadesh/components/panel/hooks";
import type { NavAccessContext } from "kadesh/components/profile/usuarios/can";
import type { OnboardingContextKey } from "./constants";
import { AiOverviewCard } from "./AiOverviewCard";
import { AiTodayCard } from "./AiTodayCard";
import { AiCompanyKnowledgeCard } from "./AiCompanyKnowledgeCard";
import { AiRecommendationsCard } from "./AiRecommendationsCard";
import { useAiActionLinks } from "./useAiActionLinks";
import {
  aiFadeUpVariants,
  aiMotionTransition,
  aiStaggerContainer,
} from "./motion";

type AiDashboardTabProps = {
  companyId: string;
  canManageAi: boolean;
  isCompanyWide: boolean;
  navCtx?: NavAccessContext;
  onOpenSettings: () => void;
  onOpenCompanyInfo: (step?: OnboardingContextKey) => void;
};

/**
 * Hub de Kadesh AI, de arriba abajo: qué hace y en qué va → qué hacer hoy →
 * recomendaciones (izquierda) y lo que ya sabe del negocio (derecha).
 */
export function AiDashboardTab({
  companyId,
  canManageAi,
  isCompanyWide,
  navCtx,
  onOpenSettings,
  onOpenCompanyInfo,
}: AiDashboardTabProps) {
  const { remainingQuota, refetch } = useRemainingCredits(companyId);
  const reduce = useReducedMotion();
  const linkFor = useAiActionLinks({
    navCtx,
    onOpenCompanyInfo: () => onOpenCompanyInfo(),
  });

  return (
    <motion.div
      className="space-y-4"
      variants={aiStaggerContainer(reduce, 0.04)}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={aiFadeUpVariants(reduce)}
        transition={aiMotionTransition(reduce)}
      >
        <AiOverviewCard
          companyId={companyId}
          canManageAi={canManageAi}
          isCompanyWide={isCompanyWide}
          onOpenSettings={onOpenSettings}
          onOpenCompanyInfo={onOpenCompanyInfo}
        />
      </motion.div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <motion.div
          className="min-w-0 space-y-4"
          variants={aiFadeUpVariants(reduce)}
          transition={aiMotionTransition(reduce)}
        >
          <AiTodayCard
            companyId={companyId}
            canManageAi={canManageAi}
            isCompanyWide={isCompanyWide}
            remainingQuota={remainingQuota}
            onGenerated={() => void refetch()}
            onConfigure={onOpenSettings}
            linkFor={linkFor}
          />
          <AiRecommendationsCard
            companyId={companyId}
            linkFor={linkFor}
            onOpenCompanyInfo={() => onOpenCompanyInfo()}
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
      </div>
    </motion.div>
  );
}
