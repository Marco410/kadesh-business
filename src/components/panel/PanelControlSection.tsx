"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@apollo/client";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import { preserveRegisterSuccessParam } from "kadesh/utils/facebook-pixel";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserIcon,
  Chart01Icon,
  FileIcon,
  FolderIcon,
  CalendarIcon,
  UserAdd01Icon,
  UserGroupIcon,
  WorkIcon,
  FlashIcon,
  SparklesIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
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
import { cn } from "kadesh/utils/cn";

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

const navItems = [
  { key: "inicio" as const, label: "Inicio", icon: DashboardSquare01Icon },
  { key: "profile" as const, label: "Datos del perfil", icon: UserIcon },
  {
    key: "ai" as const,
    label: KADESH_URIM_AI_NAME,
    icon: SparklesIcon,
    requireAiManage: true,
  },
  {
    key: "clientes" as const,
    label: "Clientes",
    icon: Chart01Icon,
    requireVendedor: true,
  },
  {
    key: "vendedores" as const,
    label: "Vendedores",
    icon: UserGroupIcon,
    requireAdminCompany: true,
    requireSalesPersonManagement: false,
  },
  { key: "archivos" as const, label: "Archivos", icon: FileIcon },
  { key: "proyectos" as const, label: "Proyectos", icon: FolderIcon },
  { key: "cotizaciones" as const, label: "Cotizaciones", icon: FileIcon },
  { key: "calendar" as const, label: "Mi Calendario", icon: CalendarIcon },
  {
    key: "workspaces" as const,
    label: "Espacios de trabajo",
    icon: WorkIcon,
  },
  {
    key: "whatsapp" as const,
    label: "WhatsApp Business",
    icon: WhatsappIcon,
    requireAdminCompany: true,
  },
];

const navItemsKadeshConfig = [
  { key: "referidos" as const, label: "Referidos", icon: UserAdd01Icon },
  { key: "novedades" as const, label: "Novedades", icon: FlashIcon },
];

function DashboardSidebar({
  selectedTab,
  onTabChange,
  hasVendedorRole,
  isAdminCompany,
  hasSalesPersonManagement,
  hasUploadFilesFeature,
  hasWorkspacesFeature,
  canManageAi,
  isAiLive,
}: {
  selectedTab: string;
  onTabChange: (key: string) => void;
  hasVendedorRole: boolean;
  isAdminCompany: boolean;
  hasSalesPersonManagement: boolean;
  hasUploadFilesFeature: boolean;
  hasWorkspacesFeature: boolean;
  canManageAi: boolean;
  isAiLive: boolean;
}) {
  return (
    <aside className="w-full lg:w-60 shrink-0 flex flex-col gap-5 overflow-visible">
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <linearGradient
            id="kadesh-urim-icon-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="var(--ai-urim-purple)" />
            <stop offset="100%" stopColor="var(--ai-urim-blue)" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className={cn(
          "rounded-2xl",
          isAiLive ? "ai-live-ring shadow-sm" : "shadow-sm",
        )}
      >
        <nav
          className={cn(
            "rounded-[14px] bg-white p-2 dark:bg-[#1e1e1e]",
            isAiLive
              ? undefined
              : "rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a]",
          )}
        >
          {navItems.map((item) => {
            if (
              "requireVendedor" in item &&
              item.requireVendedor &&
              !hasVendedorRole
            )
              return null;
            if (
              "requireAdminCompany" in item &&
              item.requireAdminCompany &&
              !isAdminCompany
            )
              return null;
            if (
              "requireAiManage" in item &&
              item.requireAiManage &&
              !canManageAi
            )
              return null;
            if (
              "requireSalesPersonManagement" in item &&
              item.requireSalesPersonManagement &&
              !hasSalesPersonManagement
            )
              return null;
            if (
              "requireUploadFilesFeature" in item &&
              item.requireUploadFilesFeature &&
              !hasUploadFilesFeature
            )
              return null;
            if (
              "requireWorkspacesFeature" in item &&
              item.requireWorkspacesFeature &&
              !hasWorkspacesFeature
            )
              return null;
            const isActive = selectedTab === item.key;
            const isAi = item.key === "ai";
            return (
              <button
                key={item.key}
                type="button"
                data-tour={`nav-${item.key}`}
                onClick={() => onTabChange(item.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors",
                  isActive
                    ? isAi
                      ? "ai-urim-fill shadow-[0_6px_14px_rgba(139,92,246,0.28)]"
                      : "bg-orange-500 text-white dark:bg-orange-500 dark:text-white"
                    : "text-[#616161] dark:text-[#b0b0b0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]",
                )}
              >
                <span
                  className={isAi && !isActive ? "ai-urim-icon" : undefined}
                >
                  <HugeiconsIcon icon={item.icon} size={20} />
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      <nav className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-2 shadow-sm">
        {navItemsKadeshConfig.map((item) => {
          const isActive = selectedTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              data-tour={`nav-${item.key}`}
              onClick={() => onTabChange(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-500 text-white dark:bg-orange-500 dark:text-white"
                  : "text-[#616161] dark:text-[#b0b0b0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
              }`}
            >
              <HugeiconsIcon icon={item.icon} size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
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
    if (embedded) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent mx-auto" />
            <p className="mt-3 text-sm text-[#616161] dark:text-[#b0b0b0]">
              Cargando panel...
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-[#616161] dark:text-[#b0b0b0]">
            Cargando panel...
          </p>
        </div>
      </div>
    );
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
  if (embedded) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Cargando panel...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto" />
        <p className="mt-4 text-[#616161] dark:text-[#b0b0b0]">
          Cargando panel...
        </p>
      </div>
    </div>
  );
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
