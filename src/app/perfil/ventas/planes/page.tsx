"use client";

import { useQuery } from "@apollo/client";
import { Footer, Navigation } from "kadesh/components/layout";
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
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <SubscriptionProvider companyId={companyId}>
          <PlansSection />
        </SubscriptionProvider>
      </main>
      <Footer />
    </div>
  );
}
