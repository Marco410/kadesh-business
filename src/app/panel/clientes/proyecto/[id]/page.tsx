"use client";

import PanelShell from "kadesh/components/panel/PanelShell";
import ProjectDetailSection from "kadesh/components/profile/sales/proyecto/ProjectDetailSection";
import { useStableQuery } from "kadesh/providers/useStableQuery";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { SubscriptionProvider } from "kadesh/components/profile/sales/SubscriptionContext";
import { useUser } from "kadesh/utils/UserContext";
import CurrentPlanSection from "kadesh/components/profile/sales/CurrentPlanSection";

export default function ProjectDetailPage() {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const { data: userData } = useStableQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  return (
    <PanelShell selectedTab="proyectos" title="Detalle del proyecto">
      <SubscriptionProvider companyId={companyId}>
        <ProjectDetailSection />
      </SubscriptionProvider>
    </PanelShell>
  );
}
