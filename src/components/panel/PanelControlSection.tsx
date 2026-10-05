"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@apollo/client";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import { preserveRegisterSuccessParam } from "kadesh/utils/facebook-pixel";
import ProfileData from "kadesh/components/profile/ProfileData";
import { AiSection } from "kadesh/components/profile/ai/AiSection";
import SalesSection from "kadesh/components/profile/sales/SalesSection";
import VendedoresSection from "kadesh/components/profile/sales/vendedores/VendedoresSection";
import ArchivosSection from "kadesh/components/profile/sales/archivos/ArchivosSection";
import { ProyectosSection } from "kadesh/components/profile/sales/proyecto";
import { QuotationsSection } from "kadesh/components/profile/sales/quotations";
import VendedoresCalendarioTab from "kadesh/components/profile/sales/vendedores/VendedoresCalendarioTab";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  SUBSCRIPTION_STATUS_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
  type SubscriptionStatusResponse,
  type SubscriptionStatusVariables,
} from "kadesh/components/profile/sales/queries";
import { hasPlanFeature } from "kadesh/components/profile/sales/helpers/plan-features";
import { Footer, Navigation } from "kadesh/components/layout";
import { CompanyDashboard } from "kadesh/components/panel/dashboard";
import { PLAN_FEATURE_KEYS, Role } from "kadesh/constants/constans";
import FeatureLockedSection from "kadesh/components/profile/sales/FeatureLockedSection";
import RoleAccessDeniedSection from "kadesh/components/profile/sales/RoleAccessDeniedSection";
import { canManageCompanyAi } from "kadesh/utils/user-roles";
import { SubscriptionProvider } from "kadesh/components/profile/sales/SubscriptionContext";
import ReferralDashboardSection from "kadesh/components/profile/referral/ReferralDashboardSection";
import WorkspacesTab from "kadesh/components/profile/sales/workspaces/WorkspacesTab";
import CreateWorkspaceModal from "kadesh/components/profile/sales/workspaces/CreateWorkspaceModal";
import { NovedadesPage } from "../changelog";
import { KADESH_URIM_AI_NAME } from "kadesh/components/profile/ai/constants";
import { useCompanyAiLive } from "kadesh/components/profile/ai/useCompanyAiLive";
import { WhatsAppSettingsSection } from "kadesh/components/profile/whatsapp/WhatsAppSettingsSection";
import PanelControlSkeleton from "./PanelControlSkeleton";
import DashboardSidebar from "./DashboardSidebar";

const VALID_TABS = [
  "inicio",
  "profile",
  "ai",
  "clientes",
  "vendedores",
  "archivos",
  "proyectos",
  "cotizaciones",
  "calendar",
  "workspaces",
  "whatsapp",
  "referidos",
  "novedades",
] as const;

function getValidTab(
  tabFromUrl: string | null,
  hasVendedorRole: boolean,
  isAdminCompany: boolean,
  hasUploadFilesFeature: boolean,
  hasCalendarFeature: boolean,
  hasWorkspacesFeature: boolean,
): (typeof VALID_TABS)[number] {
  /*   if (!tabFromUrl || !VALID_TABS.includes(tabFromUrl as (typeof VALID_TABS)[number])) {
    return "inicio";
  }
  if (tabFromUrl === "clientes" && !hasVendedorRole) {
    return "inicio";
  }
  if (tabFromUrl === "vendedores" && !isAdminCompany) {
    return "inicio";
  }
  if (tabFromUrl === "archivos" && !hasUploadFilesFeature) {
    return "inicio";
  }
  if (tabFromUrl === "calendar" && !hasCalendarFeature) {
    return "inicio";
  }
  if (tabFromUrl === "workspaces" && !hasWorkspacesFeature) {
    return "inicio";
  } */

  if (!tabFromUrl && hasVendedorRole) {
    return "inicio";
  }

  return tabFromUrl as (typeof VALID_TABS)[number];
}

type PanelControlSectionProps = {
  embedded?: boolean;
};

function PanelControlSectionContent({
  embedded = false,
}: PanelControlSectionProps) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tabFromUrl = searchParams.get("tab");
  const hasVendedorRole =
    user?.roles?.some((r) => r.name === Role.VENDEDOR) ?? false;
  const isAdminCompany =
    user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;
  const isUserCompany =
    user?.roles?.some((r) => r.name === Role.USER_COMPANY) ?? false;
  const hasCompanyWideLeadScope = isAdminCompany || isUserCompany;
  const canManageAi = canManageCompanyAi(user);

  const { data: userData, refetch: refetchUserCompany } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: user?.id ?? "" } },
    skip: !user?.id,
  });
  const companyId = userData?.user?.company?.id ?? null;
  const { isAiLive } = useCompanyAiLive(companyId);

  const { data: subscriptionData, loading: subscriptionLoading } = useQuery<
    SubscriptionStatusResponse,
    SubscriptionStatusVariables
  >(SUBSCRIPTION_STATUS_QUERY, {
    variables: { companyId },
    skip: !companyId,
  });
  const subscription =
    subscriptionData?.subscriptionStatus?.subscription ?? null;
  const hasAdminRole = user?.roles?.some((r) => r.name === Role.ADMIN) ?? false;
  const hasSalesPersonManagement = hasPlanFeature(
    subscription?.planFeatures ?? null,
    PLAN_FEATURE_KEYS.SALES_PERSON_MANAGEMENT,
  );
  const hasUploadFilesFeature = hasPlanFeature(
    subscription?.planFeatures ?? null,
    PLAN_FEATURE_KEYS.UPLOAD_FILES,
  );
  const hasProjectsFeature = hasPlanFeature(
    subscription?.planFeatures ?? null,
    PLAN_FEATURE_KEYS.PROJECTS,
  );
  const hasQuotationsFeature = hasPlanFeature(
    subscription?.planFeatures ?? null,
    PLAN_FEATURE_KEYS.QUOTATIONS,
  );
  const hasCalendarFeature = hasPlanFeature(
    subscription?.planFeatures ?? null,
    PLAN_FEATURE_KEYS.CALENDAR_CRM,
  );
  const hasWorkspacesFeature = hasPlanFeature(
    subscription?.planFeatures ?? null,
    PLAN_FEATURE_KEYS.WORKSPACES,
  );
  const hasWhatsappFeature = hasPlanFeature(
    subscription?.planFeatures ?? null,
    PLAN_FEATURE_KEYS.WHATSAPP,
  );
  const selectedTab = getValidTab(
    tabFromUrl,
    hasVendedorRole,
    isAdminCompany,
    hasUploadFilesFeature,
    hasCalendarFeature,
    hasWorkspacesFeature,
  );

  const handleTabChange = (key: string) => {
    const params = preserveRegisterSuccessParam(
      new URLSearchParams(searchParams.toString()),
    );
    params.set("tab", key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (companyId && subscriptionLoading) return;
    // En el panel embebido, `/panel` sin `tab` es Extracción B2B. No reescribir a inicio.
    if (embedded && !tabFromUrl) return;
    if (!tabFromUrl || tabFromUrl !== selectedTab) {
      const params = preserveRegisterSuccessParam(
        new URLSearchParams(searchParams.toString()),
      );
      params.set("tab", selectedTab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [
    companyId,
    embedded,
    subscriptionLoading,
    tabFromUrl,
    selectedTab,
    pathname,
    router,
    searchParams,
  ]);

  useEffect(() => {
    if (!loading && !user?.id) {
      router.push(Routes.auth.login);
    }
  }, [user, loading, router]);

  if (loading) {
    return <PanelControlSkeleton embedded={embedded} />;
  }

  if (!user?.id) {
    return null;
  }

  const panelBody = (
    <SubscriptionProvider companyId={companyId}>
      <div className={embedded ? undefined : "pt-20 pb-12"}>
        <div
          className={embedded ? undefined : "mx-auto px-10 sm:px-10 lg:px-10"}
        >
          {!embedded && (
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-white">
                Panel de control
              </h1>
              <p className="text-[#616161] dark:text-[#b0b0b0] mt-1">
                Gestiona tu información y ventas
              </p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            <DashboardSidebar
              selectedTab={selectedTab}
              onTabChange={handleTabChange}
              hasVendedorRole={hasVendedorRole}
              isAdminCompany={isAdminCompany}
              hasSalesPersonManagement={hasSalesPersonManagement}
              hasUploadFilesFeature={hasUploadFilesFeature}
              hasWorkspacesFeature={hasWorkspacesFeature}
              canManageAi={canManageAi}
              isAiLive={isAiLive}
            />

            <main className="flex-1 min-w-0">
              {selectedTab === "inicio" && (
                <CompanyDashboard
                  userId={user.id}
                  userName={user.name ?? ""}
                  companyId={companyId}
                  hasCompanyWideLeadScope={hasCompanyWideLeadScope}
                  isAdminCompany={isAdminCompany}
                  hasVendedorRole={hasVendedorRole}
                  canManageAi={canManageAi}
                  hasAdminRole={hasAdminRole}
                  subscription={subscription}
                  referralCode={userData?.user?.referralCode ?? ""}
                  bank={userData?.user?.bank}
                  clabe={userData?.user?.clabe}
                  cardNumber={userData?.user?.cardNumber}
                  onCompanyCreated={refetchUserCompany}
                />
              )}

              {selectedTab === "profile" && (
                <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8 shadow-sm">
                  <ProfileData user={user} />
                </div>
              )}

              {selectedTab === "ai" &&
                (canManageAi ? (
                  <AiSection
                    companyId={companyId}
                    canManageAi={canManageAi}
                    isCompanyWide={hasCompanyWideLeadScope}
                  />
                ) : (
                  <RoleAccessDeniedSection
                    title={`Solo el administrador configura ${KADESH_URIM_AI_NAME}`}
                    description={`Los vendedores usarán ${KADESH_URIM_AI_NAME} con la configuración de la empresa. Si necesitas cambiar proveedor, API key o modalidad, pide acceso al administrador.`}
                    backHref={Routes.panel}
                    backLabel="Volver al inicio"
                  />
                ))}

              {selectedTab === "clientes" && hasVendedorRole && (
                <div className="space-y-6">
                  <SalesSection userId={user.id} />
                </div>
              )}

              {selectedTab === "vendedores" &&
                (isAdminCompany && hasSalesPersonManagement ? (
                  <div className="space-y-6">
                    <VendedoresSection userId={user.id} />
                  </div>
                ) : (
                  <FeatureLockedSection sectionName="Vendedores" />
                ))}

              {selectedTab === "archivos" &&
                (hasUploadFilesFeature ? (
                  <div className="space-y-6">
                    <ArchivosSection userId={user.id} />
                  </div>
                ) : (
                  <FeatureLockedSection sectionName="Archivos" />
                ))}

              {selectedTab === "proyectos" &&
                (hasProjectsFeature ? (
                  <div className="space-y-6">
                    <ProyectosSection userId={user.id} />
                  </div>
                ) : (
                  <FeatureLockedSection sectionName="Proyectos" />
                ))}

              {selectedTab === "cotizaciones" &&
                (hasQuotationsFeature ? (
                  <div className="space-y-6">
                    <QuotationsSection userId={user.id} />
                  </div>
                ) : (
                  <FeatureLockedSection sectionName="Cotizaciones" />
                ))}

              {selectedTab === "calendar" &&
                (hasCalendarFeature ? (
                  <div className="space-y-6">
                    <VendedoresCalendarioTab userId={user.id} />
                  </div>
                ) : (
                  <FeatureLockedSection sectionName="Calendario" />
                ))}

              {selectedTab === "workspaces" &&
                (hasWorkspacesFeature ? (
                  <div className="space-y-6">
                    <WorkspacesTab
                      userId={user.id}
                      onRequestCreateWorkspace={() =>
                        setCreateWorkspaceOpen(true)
                      }
                    />
                  </div>
                ) : (
                  <FeatureLockedSection sectionName="Espacios de trabajo" />
                ))}

              {selectedTab === "whatsapp" &&
                (isAdminCompany && hasWhatsappFeature ? (
                  <WhatsAppSettingsSection companyId={companyId} />
                ) : (
                  <FeatureLockedSection sectionName="WhatsApp Business" />
                ))}

              {selectedTab === "referidos" && (
                <div className="flex flex-col gap-5">
                  <div className="max-w-none">
                    <h2 className="text-xl font-semibold text-[#212121] dark:text-white">
                      Referidos
                    </h2>
                    <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e]">
                      Usuarios que se registraron con tu código y tus comisiones
                      generadas.
                    </p>
                  </div>
                  <ReferralDashboardSection userId={user.id} />
                </div>
              )}

              {selectedTab === "novedades" && (
                <div className="flex flex-col gap-5">
                  <NovedadesPage />
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </SubscriptionProvider>
  );

  return (
    <>
      {embedded ? (
        panelBody
      ) : (
        <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a0a]">
          <Navigation />
          {panelBody}
          <Footer />
        </div>
      )}
      {hasWorkspacesFeature && user?.id && (
        <CreateWorkspaceModal
          isOpen={createWorkspaceOpen}
          onClose={() => setCreateWorkspaceOpen(false)}
          userId={user.id}
          companyId={companyId}
        />
      )}
    </>
  );
}

function PanelControlSectionFallback({
  embedded = false,
}: PanelControlSectionProps) {
  return <PanelControlSkeleton embedded={embedded} />;
}

export default function PanelControlSection({
  embedded = false,
}: PanelControlSectionProps) {
  return (
    <Suspense fallback={<PanelControlSectionFallback embedded={embedded} />}>
      <PanelControlSectionContent embedded={embedded} />
    </Suspense>
  );
}
