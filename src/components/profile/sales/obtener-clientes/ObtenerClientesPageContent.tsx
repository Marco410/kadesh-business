"use client";

import { useQuery } from "@apollo/client";
import { Footer, Navigation } from "kadesh/components/layout";
import EmptyCompanySection from "kadesh/components/profile/sales/EmptyCompanySection";
import ObtenerClientesSection from "./ObtenerClientesSection";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { SubscriptionProvider } from "kadesh/components/profile/sales/SubscriptionContext";
import { useUser } from "kadesh/utils/UserContext";

export interface ObtenerClientesPageContentProps {
  embedded?: boolean;
  onLeadsSyncSuccess?: () => void | Promise<void>;
}

export default function ObtenerClientesPageContent({
  embedded = false,
  onLeadsSyncSuccess,
}: ObtenerClientesPageContentProps) {
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
    const emptyCompany = (
      <EmptyCompanySection userId={userId} onSuccess={async () => {}} />
    );

    if (embedded) return emptyCompany;

    return (
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 py-8 pt-20 sm:px-6 lg:px-8">
          {emptyCompany}
        </main>
        <Footer />
      </div>
    );
  }

  const content = (
    <SubscriptionProvider companyId={companyId}>
      <div
        className={
          embedded
            ? undefined
            : "mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8"
        }
      >
        <ObtenerClientesSection onLeadsSyncSuccess={onLeadsSyncSuccess} />
      </div>
    </SubscriptionProvider>
  );

  if (embedded) return content;

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      {content}
    </div>
  );
}
