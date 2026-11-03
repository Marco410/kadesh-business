"use client";

import { useQuery } from "@apollo/client";
import PanelShell from "kadesh/components/panel/PanelShell";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { SubscriptionProvider } from "kadesh/components/profile/sales/SubscriptionContext";
import QuotationDetail from "kadesh/components/profile/sales/quotations/QuotationDetail";
import { useUser } from "kadesh/utils/UserContext";

export default function QuotationDetailPage() {
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
    <PanelShell selectedTab="cotizaciones" title="Cotización">
      <SubscriptionProvider companyId={companyId}>
        <QuotationDetail />
      </SubscriptionProvider>
    </PanelShell>
  );
}

