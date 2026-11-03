"use client";

import { useQuery } from "@apollo/client";
import PanelShell from "kadesh/components/panel/PanelShell";
import { DetailLeadSection } from "kadesh/components/profile/sales/detail_lead";
import { USER_COMPANY_CATEGORIES_QUERY, UserCompanyCategoriesResponse, UserCompanyCategoriesVariables } from "kadesh/components/profile/sales/queries";
import { SubscriptionProvider } from "kadesh/components/profile/sales/SubscriptionContext";
import { useUser } from "kadesh/utils/UserContext";

export default function LeadDetailPage() {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;
  return (
    <PanelShell selectedTab="clientes" title="Detalle del cliente">
      <SubscriptionProvider companyId={companyId}>
        <DetailLeadSection />
      </SubscriptionProvider>
    </PanelShell>
  );
}
