"use client";

import { useQuery } from "@apollo/client";
import { Footer, Navigation } from "kadesh/components/layout";
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
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <SubscriptionProvider companyId={companyId}>
        <QuotationDetail />
      </SubscriptionProvider>
      <Footer />
    </div>
  );
}

