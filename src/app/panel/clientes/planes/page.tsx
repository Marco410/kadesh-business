"use client";

import { useQuery } from "@apollo/client";
import PanelShell from "kadesh/components/panel/PanelShell";
import PlansSection from "kadesh/components/profile/sales/planes/PlansSection";
import { SubscriptionProvider } from "kadesh/components/profile/sales/SubscriptionContext";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { useUser } from "kadesh/utils/UserContext";

export default function PlanesPage() {
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
    <PanelShell selectedTab="planes" title="Planes">
      <div className="mx-auto max-w-7xl">
        <SubscriptionProvider companyId={companyId}>
          <PlansSection />
        </SubscriptionProvider>
      </div>
    </PanelShell>
  );
}
