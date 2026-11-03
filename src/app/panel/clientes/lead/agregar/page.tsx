"use client";

import { useQuery } from "@apollo/client";
import PanelShell from "kadesh/components/panel/PanelShell";
import { AddLeadSection } from "kadesh/components/profile/sales/lead";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { SubscriptionProvider } from "kadesh/components/profile/sales/SubscriptionContext";
import { useUser } from "kadesh/utils/UserContext";
import EmptyCompanySection from "kadesh/components/profile/sales/EmptyCompanySection";

export default function AgregarLeadPage() {
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

  if (!companyId) {
    return (
      <PanelShell selectedTab="clientes" title="Nuevo cliente">
        <div className="mx-auto max-w-7xl">
          <EmptyCompanySection
            userId={userId}
            onSuccess={async () => {}}
          />
        </div>
    </PanelShell>
    );
  }

  return (
    <PanelShell selectedTab="clientes" title="Nuevo cliente">
      <SubscriptionProvider companyId={companyId}>
        <div className="pb-6">
          <AddLeadSection />
        </div>
      </SubscriptionProvider>
    </PanelShell>
  );
}
