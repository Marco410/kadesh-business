"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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
  SAAS_PLANS_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
  type SubscriptionStatusResponse,
  type SubscriptionStatusVariables,
  type SaasPlansResponse,
} from "kadesh/components/profile/sales/queries";
import {
  betaFeatureKeysForSubscription,
  hasPlanFeature,
} from "kadesh/components/profile/sales/helpers/plan-features";
import { Footer, Navigation } from "kadesh/components/layout";
import { CompanyDashboard } from "kadesh/components/panel/dashboard";
import { PLAN_FEATURE_KEYS, Role } from "kadesh/constants/constans";
import FeatureLockedSection from "kadesh/components/profile/sales/FeatureLockedSection";
import RoleAccessDeniedSection from "kadesh/components/profile/sales/RoleAccessDeniedSection";
import {
  canManageCompanyAi,
  canManageCompanyUsers,
} from "kadesh/utils/user-roles";
import {
  can,
  canAccessNavTab,
  canViewCompanyWideLeads,
} from "kadesh/components/profile/usuarios/can";
import { PERMISSION_KEYS } from "kadesh/components/profile/usuarios/permissions";
import { UsuariosSection } from "kadesh/components/profile/usuarios";
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
  "usuarios",
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
  const hasCompanyWideLeadScope = canViewCompanyWideLeads(user);
  const canManageAi = canManageCompanyAi(user);
  const canManageUsers = canManageCompanyUsers(user);
  const navAccessCtx = {
    hasVendedorRole,
    isAdminCompany,
    canManageAi,
  };
  const canSeeAi = canAccessNavTab(user, "ai", navAccessCtx);
  const canSeeClientes = canAccessNavTab(user, "clientes", navAccessCtx);
  const canSeeVendedores = canAccessNavTab(user, "vendedores", navAccessCtx);
  const canSeeArchivos = canAccessNavTab(user, "archivos", navAccessCtx);
  const canSeeProyectos = canAccessNavTab(user, "proyectos", navAccessCtx);
  const canSeeCotizaciones = canAccessNavTab(
    user,
    "cotizaciones",
    navAccessCtx,
  );
  const canSeeCalendar = canAccessNavTab(user, "calendar", navAccessCtx);
  const canSeeWorkspaces = canAccessNavTab(user, "workspaces", navAccessCtx);
  const canSeeWhatsapp = canAccessNavTab(user, "whatsapp", navAccessCtx);
  const canSeeInicio = canAccessNavTab(user, "inicio", navAccessCtx);
  const canSeeProfile = canAccessNavTab(user, "profile", navAccessCtx);
  const canConfigureWhatsapp = can(
    user,
    PERMISSION_KEYS.WHATSAPP_CONFIGURAR,
    () => isAdminCompany,
  );
  const canConfigureAi = can(user, PERMISSION_KEYS.AI_CONFIGURAR, () =>
    canManageCompanyAi(user),
  );

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
  const { data: plansData } = useQuery<SaasPlansResponse>(SAAS_PLANS_QUERY, {
    skip: !companyId,
    fetchPolicy: "cache-and-network",
  });
  const betaFeatureKeys = useMemo(
    () =>
      betaFeatureKeysForSubscription(plansData?.saasPlans ?? [], subscription),
    [plansData?.saasPlans, subscription],
  );
  const whatsappIsBeta = betaFeatureKeys.has(PLAN_FEATURE_KEYS.WHATSAPP);
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
              user={user}
              selectedTab={selectedTab}
              onTabChange={handleTabChange}
              hasVendedorRole={hasVendedorRole}
              isAdminCompany={isAdminCompany}
              canManageAi={canManageAi}
              isAiLive={isAiLive}
              betaFeatureKeys={betaFeatureKeys}
            />

            <main className="flex-1 min-w-0">
              {selectedTab === "inicio" &&
                (canSeeInicio ? (
                  <CompanyDashboard
                    userId={user.id}
                    userName={user.name ?? ""}
                    companyId={companyId}
                    hasCompanyWideLeadScope={hasCompanyWideLeadScope}
                    isAdminCompany={isAdminCompany}
                    hasVendedorRole={hasVendedorRole}
                    canManageAi={canSeeAi}
                    hasAdminRole={hasAdminRole}
                    subscription={subscription}
                    referralCode={userData?.user?.referralCode ?? ""}
                    bank={userData?.user?.bank}
                    clabe={userData?.user?.clabe}
                    cardNumber={userData?.user?.cardNumber}
                    onCompanyCreated={refetchUserCompany}
                  />
                ) : (
                  <RoleAccessDeniedSection
                    title="No tienes acceso a Inicio"
                    description="Pide a Gerencia o al administrador que te active el permiso de ver el inicio."
                    backHref={`${Routes.panel}?tab=profile`}
                    backLabel="Ir al perfil"
                  />
                ))}

              {selectedTab === "profile" &&
                (canSeeProfile ? (
                  <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8 shadow-sm">
                    <ProfileData user={user} />
                  </div>
                ) : (
                  <RoleAccessDeniedSection
                    title="No tienes acceso al perfil"
                    description="Pide a Gerencia o al administrador que te active el permiso de ver el perfil."
                    backHref={`${Routes.panel}?tab=inicio`}
                    backLabel="Volver al inicio"
                  />
                ))}

              {selectedTab === "usuarios" &&
                (canManageUsers ? (
                  <UsuariosSection />
                ) : (
                  <RoleAccessDeniedSection
                    title="Solo administración y Gerencia gestionan usuarios"
                    description="Pide acceso al administrador de tu empresa si necesitas agregar personas o cambiar permisos."
                    backHref={`${Routes.panel}?tab=inicio`}
                    backLabel="Volver al inicio"
                  />
                ))}

              {selectedTab === "ai" &&
                (canSeeAi ? (
                  <AiSection
                    companyId={companyId}
                    canManageAi={canConfigureAi}
                    isCompanyWide={hasCompanyWideLeadScope}
                  />
                ) : (
                  <RoleAccessDeniedSection
                    title={`No tienes acceso a ${KADESH_URIM_AI_NAME}`}
                    description={`Pide a Gerencia o al administrador que te active el permiso de ver ${KADESH_URIM_AI_NAME}.`}
                    backHref={Routes.panel}
                    backLabel="Volver al inicio"
                  />
                ))}

              {selectedTab === "clientes" &&
                (canSeeClientes ? (
                  <div className="space-y-6">
                    <SalesSection userId={user.id} />
                  </div>
                ) : null)}

              {selectedTab === "vendedores" &&
                (!canSeeVendedores ? (
                  <RoleAccessDeniedSection
                    title="No tienes acceso a Vendedores"
                    description="Pide a Gerencia o al administrador que te active el permiso de ver vendedores."
                    backHref={`${Routes.panel}?tab=inicio`}
                    backLabel="Volver al inicio"
                  />
                ) : hasSalesPersonManagement ? (
                  <div className="space-y-6">
                    <VendedoresSection userId={user.id} />
                  </div>
                ) : (
                  <FeatureLockedSection sectionName="Vendedores" />
                ))}

              {selectedTab === "archivos" &&
                (!canSeeArchivos ? (
                  <RoleAccessDeniedSection
                    title="No tienes acceso a Archivos"
                    description="Pide a Gerencia o al administrador que te active el permiso de ver archivos."
                    backHref={`${Routes.panel}?tab=inicio`}
                    backLabel="Volver al inicio"
                  />
                ) : hasUploadFilesFeature ? (
                  <div className="space-y-6">
                    <ArchivosSection userId={user.id} />
                  </div>
                ) : (
                  <FeatureLockedSection sectionName="Archivos" />
                ))}

              {selectedTab === "proyectos" &&
                (!canSeeProyectos ? (
                  <RoleAccessDeniedSection
                    title="No tienes acceso a Proyectos"
                    description="Pide a Gerencia o al administrador que te active el permiso de ver proyectos."
                    backHref={`${Routes.panel}?tab=inicio`}
                    backLabel="Volver al inicio"
                  />
                ) : hasProjectsFeature ? (
                  <div className="space-y-6">
                    <ProyectosSection userId={user.id} />
                  </div>
                ) : (
                  <FeatureLockedSection sectionName="Proyectos" />
                ))}

              {selectedTab === "cotizaciones" &&
                (!canSeeCotizaciones ? (
                  <RoleAccessDeniedSection
                    title="No tienes acceso a Cotizaciones"
                    description="Pide a Gerencia o al administrador que te active el permiso de ver cotizaciones."
                    backHref={`${Routes.panel}?tab=inicio`}
                    backLabel="Volver al inicio"
                  />
                ) : hasQuotationsFeature ? (
                  <div className="space-y-6">
                    <QuotationsSection userId={user.id} />
                  </div>
                ) : (
                  <FeatureLockedSection sectionName="Cotizaciones" />
                ))}

              {selectedTab === "calendar" &&
                (!canSeeCalendar ? (
                  <RoleAccessDeniedSection
                    title="No tienes acceso al Calendario"
                    description="Pide a Gerencia o al administrador que te active el permiso de ver el calendario."
                    backHref={`${Routes.panel}?tab=inicio`}
                    backLabel="Volver al inicio"
                  />
                ) : hasCalendarFeature ? (
                  <div className="space-y-6">
                    <VendedoresCalendarioTab userId={user.id} />
                  </div>
                ) : (
                  <FeatureLockedSection sectionName="Calendario" />
                ))}

              {selectedTab === "workspaces" &&
                (!canSeeWorkspaces ? (
                  <RoleAccessDeniedSection
                    title="No tienes acceso a Espacios de trabajo"
                    description="Pide a Gerencia o al administrador que te active el permiso de ver espacios."
                    backHref={`${Routes.panel}?tab=inicio`}
                    backLabel="Volver al inicio"
                  />
                ) : hasWorkspacesFeature ? (
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
                (!canSeeWhatsapp ? (
                  <RoleAccessDeniedSection
                    title="No tienes acceso a WhatsApp Business"
                    description="Pide a Gerencia o al administrador que te active el permiso de ver WhatsApp Business."
                    backHref={`${Routes.panel}?tab=inicio`}
                    backLabel="Volver al inicio"
                  />
                ) : hasWhatsappFeature ? (
                  <WhatsAppSettingsSection
                    companyId={companyId}
                    beta={whatsappIsBeta}
                    canConfigure={canConfigureWhatsapp}
                  />
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
      {hasWorkspacesFeature &&
        user?.id &&
        can(user, PERMISSION_KEYS.ESPACIOS_CREAR, () => isAdminCompany) && (
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
