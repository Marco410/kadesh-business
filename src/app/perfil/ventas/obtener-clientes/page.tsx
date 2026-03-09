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
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <SubscriptionProvider companyId={companyId}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#212121] dark:text-[#ffffff] mb-2">
              Obtener clientes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Selecciona una zona en el mapa y sincroniza negocios desde Google Maps como leads.
            </p>
          </div>
          <div className="mt-5 mb-4">
            <Link
              href={`${Routes.profile}?tab=ventas`}
              className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              Volver a Ventas
            </Link>
          </div>
          <ObtenerClientesSection />
        </div>
      </SubscriptionProvider>

      <Footer />
    </div>
  );
}
