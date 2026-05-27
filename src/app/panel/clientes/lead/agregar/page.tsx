"use client";

import { useQuery } from "@apollo/client";
import { Footer, Navigation } from "kadesh/components/layout";
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
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          <EmptyCompanySection
            userId={userId}
            onSuccess={async () => {}}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <SubscriptionProvider companyId={companyId}>
        <main className="pt-20 pb-12">
          <AddLeadSection />
        </main>
      </SubscriptionProvider>
      <Footer />
    </div>
  );
}
