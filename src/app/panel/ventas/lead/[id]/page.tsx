"use client";

import { useQuery } from "@apollo/client";
import { Footer, Navigation } from "kadesh/components/layout";
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
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <SubscriptionProvider companyId={companyId}>
        <DetailLeadSection />
      </SubscriptionProvider>
      <Footer />
    </div>
  );
}
