"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { useRemainingCredits } from "kadesh/components/panel/hooks";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { useApplyOnKeyChange } from "kadesh/utils/useApplyOnKeyChange";
import { useUser } from "kadesh/utils/UserContext";
import { isAdminCompanyUser } from "kadesh/utils/user-roles";
import PanelControlSection from "./PanelControlSection";
import PanelControlSkeleton from "./PanelControlSkeleton";
import PanelMapSkeleton from "./PanelMapSkeleton";
import PanelShell from "./PanelShell";
import { ObtenerClientesPageContent } from "kadesh/components/profile/sales/obtener-clientes";

type PanelMainTab = "control" | "extraccion";

function getMainTabFromUrl(tabParam: string | null, canAccessExtraccion: boolean): PanelMainTab {
  if (!canAccessExtraccion) return "control";
  return tabParam ? "control" : "extraccion";
}

/**
 * `/panel`: Extracción B2B (sin `tab`, solo admin de empresa) y el panel de control (`?tab=`),
 * dentro del shell de paneles (`PanelShell`). Extracción es un item más del menú; antes era un
 * segmentado arriba del contenido.
 */
function PanelPageSectionContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const { user, loading: userLoading } = useUser();
  const canAccessExtraccion = isAdminCompanyUser(user);
  const { data: userData } = useQuery<UserCompanyCategoriesResponse, UserCompanyCategoriesVariables>(
    USER_COMPANY_CATEGORIES_QUERY,
    { variables: { where: { id: user?.id ?? "" } }, skip: !user?.id },
  );
  const companyId = userData?.user?.company?.id ?? null;
  const { refetch: refetchRemainingCredits } = useRemainingCredits(companyId);

  const [activeTab, setActiveTab] = useState<PanelMainTab>(() => (tabFromUrl ? "control" : "extraccion"));

  useApplyOnKeyChange(`${tabFromUrl ?? ""}\0${canAccessExtraccion}\0${userLoading}`, () => {
    if (userLoading) {
      setActiveTab(tabFromUrl ? "control" : "extraccion");
      return;
    }
    setActiveTab(getMainTabFromUrl(tabFromUrl, canAccessExtraccion));
  });

  const showControl = activeTab === "control" || (!userLoading && !canAccessExtraccion);
  const selectedTab = showControl ? (tabFromUrl ?? "inicio") : null;

  return (
    <PanelShell selectedTab={selectedTab}>
      {userLoading ? (
        tabFromUrl ? (
          <PanelControlSkeleton embedded />
        ) : (
          <PanelMapSkeleton />
        )
      ) : showControl ? (
        <PanelControlSection embedded />
      ) : (
        <ObtenerClientesPageContent embedded onLeadsSyncSuccess={() => void refetchRemainingCredits()} />
      )}
    </PanelShell>
  );
}

function PanelPageSectionFallback({ initialTab }: { initialTab: string | null }) {
  return (
    <PanelShell selectedTab={initialTab}>
      {initialTab ? <PanelControlSkeleton embedded /> : <PanelMapSkeleton />}
    </PanelShell>
  );
}

export default function PanelPageSection({
  initialTab = null,
}: {
  /** `tab` de la URL. Sin valor, la ruta es el mapa (`/panel`). */
  initialTab?: string | null;
}) {
  return (
    <Suspense fallback={<PanelPageSectionFallback initialTab={initialTab} />}>
      <PanelPageSectionContent />
    </Suspense>
  );
}
