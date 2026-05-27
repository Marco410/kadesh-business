"use client";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Footer, Navigation } from "kadesh/components/layout";
import { ObtenerClientesSection } from "kadesh/components/profile/sales/obtener-clientes";
import { USER_COMPANY_CATEGORIES_QUERY, UserCompanyCategoriesResponse, UserCompanyCategoriesVariables } from "kadesh/components/profile/sales/queries";
import { SubscriptionProvider } from "kadesh/components/profile/sales/SubscriptionContext";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import EmptyCompanySection from "kadesh/components/profile/sales/EmptyCompanySection";

export default function ObtenerClientesPage() {
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
            onSuccess={async () => {
            }}
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
        <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:px-8">
          <ObtenerClientesSection />
        </div>
      </SubscriptionProvider>
    </div>
  );
}
